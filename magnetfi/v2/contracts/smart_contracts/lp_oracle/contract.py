from algopy import (
    Account,
    ARC4Contract,
    Bytes,
    Global,
    GlobalState,
    StateTotals,
    Txn,
    UInt64,
    arc4,
    op,
    subroutine,
)

# Dynamic global-state key prefixes for per-pool data.
# Key layout: prefix (9-11 bytes) + pool_id (8 bytes big-endian uint64) → ≤19 bytes per key.
_PRICE_PREFIX: bytes = b"lp_price_"
_TS_PREFIX: bytes = b"lp_ts_"
_ACTIVE_PREFIX: bytes = b"lp_active_"

# Declared capacity: 3 uint64 slots × 10 pools = 30, plus 2 headroom = 32 uints;
# 1 bytes slot for authorized_updater.
# (Algorand max is 64 total; 33 slots is well within limits.)


class LPOracle(
    ARC4Contract,
    state_totals=StateTotals(global_uints=32, global_bytes=1),
):
    """
    MagnetFi v2 LP Oracle — prices Tinyman LP tokens in mUSD (≈ USDC), scaled × 10^6.

    The oracle bot posts TWAP-smoothed prices; the on-chain deviation guard (±50%)
    is the last line of defence against a compromised bot key.

    Admin-only: set_authorized_updater, add_pool, remove_pool.
    Bot-only:   update_lp_price.
    Read-only:  get_lp_price (vaults also read global state directly via cross-app state ref).
    """

    def __init__(self) -> None:
        # Stores the 32-byte address of the oracle bot wallet.
        # Unset until admin calls set_authorized_updater().
        self.authorized_updater = GlobalState(Account)

    # ── internal helpers ──────────────────────────────────────────────────────

    @subroutine
    def _price_key(self, pool_id: UInt64) -> Bytes:
        return Bytes(_PRICE_PREFIX) + op.itob(pool_id)

    @subroutine
    def _ts_key(self, pool_id: UInt64) -> Bytes:
        return Bytes(_TS_PREFIX) + op.itob(pool_id)

    @subroutine
    def _active_key(self, pool_id: UInt64) -> Bytes:
        return Bytes(_ACTIVE_PREFIX) + op.itob(pool_id)

    @subroutine
    def _wide_ratio(self, a: UInt64, b: UInt64, c: UInt64) -> UInt64:
        """floor(a * b / c) via AVM wide arithmetic — prevents uint64 overflow."""
        high, low = op.mulw(a, b)
        return op.divw(high, low, c)

    # ── oracle bot method ─────────────────────────────────────────────────────

    @arc4.abimethod
    def update_lp_price(self, pool_id: UInt64, new_price: UInt64) -> None:
        """
        Post a new LP token price for pool_id.

        Called by the authorized oracle bot every ~5 minutes with a TWAP-smoothed price.
        On-chain guards:
          1. Caller must be authorized_updater.
          2. new_price > 0 (zero permanently bricks the pool — AUD-042).
          3. Pool must be in the active whitelist.
          4. Deviation guard: reject if >50% drop or >50% spike vs prior price.
        """
        assert Txn.sender == self.authorized_updater.value, "not authorized updater"
        assert new_price > UInt64(0), "price must be > 0"

        active_val, active_exists = op.AppGlobal.get_ex_uint64(
            Global.current_application_id, self._active_key(pool_id)
        )
        assert active_exists and active_val != UInt64(0), "pool not in whitelist"

        price_key = self._price_key(pool_id)
        prior = op.AppGlobal.get_uint64(price_key)

        # Deviation guard — only when a prior price exists.
        # add_pool() always stores initial_price, so prior == 0 only before first add_pool call,
        # which cannot happen because add_pool asserts pool is not already active.
        if prior != UInt64(0):
            # Lower: new_price >= prior * 50/100  →  floor(new_price*100/50) >= prior
            assert self._wide_ratio(new_price, UInt64(100), UInt64(50)) >= prior, "price drop >50%"
            # Upper: new_price <= prior * 150/100  →  floor(new_price*100/150) <= prior
            assert self._wide_ratio(new_price, UInt64(100), UInt64(150)) <= prior, "price spike >50%"

        op.AppGlobal.put(price_key, new_price)
        op.AppGlobal.put(self._ts_key(pool_id), Global.latest_timestamp)

    # ── admin methods ─────────────────────────────────────────────────────────

    @arc4.abimethod
    def set_authorized_updater(self, new_address: Account) -> None:
        """
        Set the oracle bot wallet address.

        Must be called before any price can be posted.
        Zero address is rejected — it would permanently disable price updates (AUD-044).
        """
        assert Txn.sender == Global.creator_address, "admin only"
        assert new_address != Global.zero_address, "zero address not allowed"
        self.authorized_updater.value = new_address

    @arc4.abimethod
    def add_pool(self, pool_id: UInt64, initial_price: UInt64) -> None:
        """
        Register a new LP pool and anchor its first price.

        initial_price is set by the admin under the hardware wallet — this price is stored
        immediately so the deviation guard is active from the very first bot update,
        closing the first-post manipulation window (AUD-003 / AUD-043).
        """
        assert Txn.sender == Global.creator_address, "admin only"

        active_val, already_exists = op.AppGlobal.get_ex_uint64(
            Global.current_application_id, self._active_key(pool_id)
        )
        assert not (already_exists and active_val != UInt64(0)), "pool already registered"
        assert initial_price > UInt64(0), "initial price must be > 0"

        op.AppGlobal.put(self._active_key(pool_id), UInt64(1))
        op.AppGlobal.put(self._price_key(pool_id), initial_price)
        op.AppGlobal.put(self._ts_key(pool_id), Global.latest_timestamp)

    @arc4.abimethod
    def remove_pool(self, pool_id: UInt64) -> None:
        """
        Remove a pool from the active whitelist and delete its price/timestamp state.

        WARNING: removing a pool while active vaults are borrowing against it will make
        oracle prices stale for those vaults and block health-factor liquidations.
        Verify no active vaults exist for pool_id before calling (AUD-046).
        """
        assert Txn.sender == Global.creator_address, "admin only"
        op.AppGlobal.delete(self._active_key(pool_id))
        op.AppGlobal.delete(self._price_key(pool_id))
        op.AppGlobal.delete(self._ts_key(pool_id))

    # ── read-only ─────────────────────────────────────────────────────────────

    @arc4.abimethod(readonly=True)
    def get_lp_price(self, pool_id: UInt64) -> arc4.Tuple[arc4.UInt64, arc4.UInt64]:
        """
        Return (price_scaled, last_updated_timestamp) for pool_id.

        price_scaled is mUSD per LP token × 10^6 (e.g. 1_000_000 = 1.00 mUSD/LP).
        Returns (0, 0) if pool is not registered.

        Vaults can also read lp_price_<pool_id> directly via cross-app global state reference
        without calling this method — saving the inner-transaction overhead.
        """
        price = op.AppGlobal.get_uint64(self._price_key(pool_id))
        ts = op.AppGlobal.get_uint64(self._ts_key(pool_id))
        return arc4.Tuple((arc4.UInt64(price), arc4.UInt64(ts)))
