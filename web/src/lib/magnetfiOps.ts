// MagnetFi v2 — admin operations (post-deploy).
// Same algokit-utils + use-wallet-signer pattern as the deploy lib. Every call is
// built here and signed by the connected admin (or guardian) wallet.

import algosdk, { type TransactionSigner } from "algosdk";
import { AlgorandClient, microAlgo } from "@algorandfoundation/algokit-utils";

const MAX_FEE = microAlgo(50_000);
const SEND_OPTS = { coverAppCallInnerTransactionFees: true, populateAppCallResources: true };

type Which = "oracle" | "psm" | "vault";
const SPEC_URL: Record<Which, string> = {
  oracle: "/contracts/LPOracle.arc56.json",
  psm: "/contracts/PSM.arc56.json",
  vault: "/contracts/Vault.arc56.json",
};

const specCache: Partial<Record<Which, string>> = {};
async function loadSpec(which: Which): Promise<string> {
  if (!specCache[which]) {
    const res = await fetch(SPEC_URL[which]);
    if (!res.ok) throw new Error(`Failed to load ${which} contract spec`);
    specCache[which] = await res.text();
  }
  return specCache[which]!;
}

export function makeAlgorand(algod: algosdk.Algodv2, signer: TransactionSigner): AlgorandClient {
  const algorand = AlgorandClient.fromClients({ algod });
  algorand.setDefaultSigner(signer);
  return algorand;
}

function appAddr(appId: bigint): string {
  return algosdk.getApplicationAddress(appId).toString();
}

async function client(algorand: AlgorandClient, which: Which, appId: bigint, sender: string) {
  return algorand.client.getAppClientById({ appSpec: await loadSpec(which), appId, defaultSender: sender });
}

// Generic single-method call.
async function call(
  algorand: AlgorandClient, which: Which, appId: bigint, sender: string,
  method: string, args: (string | bigint)[],
): Promise<void> {
  const c = await client(algorand, which, appId, sender);
  await c.send.call({ method, args, maxFee: MAX_FEE, ...SEND_OPTS });
}

// ── Vault: risk parameters ──────────────────────────────────────────────────────
export const setRate = (al: AlgorandClient, s: string, vault: bigint, poolId: bigint, rateBps: bigint) =>
  call(al, "vault", vault, s, "set_rate", [poolId, rateBps]);
export const setLtv = (al: AlgorandClient, s: string, vault: bigint, poolId: bigint, ltvBps: bigint) =>
  call(al, "vault", vault, s, "set_ltv", [poolId, ltvBps]);
export const setLiqThreshold = (al: AlgorandClient, s: string, vault: bigint, poolId: bigint, bps: bigint) =>
  call(al, "vault", vault, s, "set_liq_threshold", [poolId, bps]);
export const setLpAsaId = (al: AlgorandClient, s: string, vault: bigint, poolId: bigint, lpAsaId: bigint) =>
  call(al, "vault", vault, s, "set_lp_asa_id", [poolId, lpAsaId]);

// ── Vault: liquidations & accrual ────────────────────────────────────────────────
export const markOverdue = (al: AlgorandClient, s: string, vault: bigint, borrower: string, poolId: bigint) =>
  call(al, "vault", vault, s, "mark_payment_overdue", [borrower, poolId]);
export const advanceAccrual = (al: AlgorandClient, s: string, vault: bigint, borrower: string, poolId: bigint) =>
  call(al, "vault", vault, s, "advance_accrual", [borrower, poolId]);
export const triggerMicro = (al: AlgorandClient, s: string, vault: bigint, borrower: string, poolId: bigint) =>
  call(al, "vault", vault, s, "trigger_micro_liquidation", [borrower, poolId]);
export const triggerPartial = (al: AlgorandClient, s: string, vault: bigint, borrower: string, poolId: bigint, tier: bigint) =>
  call(al, "vault", vault, s, "trigger_partial_liquidation", [borrower, poolId, tier]);
export const triggerFull = (al: AlgorandClient, s: string, vault: bigint, borrower: string, poolId: bigint) =>
  call(al, "vault", vault, s, "trigger_full_liquidation", [borrower, poolId]);

/** Settle a health-factor liquidation: returns mUSD to the PSM (atomic: appcall + mUSD transfer). */
export async function settleLiquidation(
  al: AlgorandClient, s: string, vault: bigint, psm: bigint,
  borrower: string, poolId: bigint, musdAmount: bigint, musdAsaId: number,
): Promise<void> {
  const vc = await client(al, "vault", vault, s);
  await al
    .newGroup()
    .addAppCallMethodCall(await vc.params.call({
      method: "settle_health_liquidation", args: [borrower, poolId, musdAmount], maxFee: MAX_FEE,
    }))
    .addAssetTransfer({ sender: s, receiver: appAddr(psm), assetId: BigInt(musdAsaId), amount: musdAmount })
    .send(SEND_OPTS);
}

// ── Vault: fees ──────────────────────────────────────────────────────────────────
export const collectFees = (al: AlgorandClient, s: string, vault: bigint) =>
  call(al, "vault", vault, s, "collect_fees", []);
export const collectAlgo = (al: AlgorandClient, s: string, vault: bigint, microAlgos: bigint) =>
  call(al, "vault", vault, s, "collect_algo", [microAlgos]);

// ── PSM: reserves & fees ─────────────────────────────────────────────────────────
export async function depositUsdc(
  al: AlgorandClient, s: string, psm: bigint, usdcBase: bigint, usdcAsaId: number,
): Promise<void> {
  const pc = await client(al, "psm", psm, s);
  await al
    .newGroup()
    .addAssetTransfer({ sender: s, receiver: appAddr(psm), assetId: BigInt(usdcAsaId), amount: usdcBase })
    .addAppCallMethodCall(await pc.params.call({ method: "deposit_usdc", args: [usdcBase], maxFee: MAX_FEE }))
    .send(SEND_OPTS);
}
export const withdrawUsdc = (al: AlgorandClient, s: string, psm: bigint, usdcBase: bigint) =>
  call(al, "psm", psm, s, "withdraw_usdc", [usdcBase]);
export const setRedeemFee = (al: AlgorandClient, s: string, psm: bigint, feeBps: bigint) =>
  call(al, "psm", psm, s, "set_redeem_fee", [feeBps]);
export const setTreasury = (al: AlgorandClient, s: string, psm: bigint, treasury: string) =>
  call(al, "psm", psm, s, "set_treasury", [treasury]);

// ── Oracle ───────────────────────────────────────────────────────────────────────
export const setPriceAnchor = (al: AlgorandClient, s: string, oracle: bigint, poolId: bigint, price: bigint) =>
  call(al, "oracle", oracle, s, "set_price_anchor", [poolId, price]);
export const setAuthorizedUpdater = (al: AlgorandClient, s: string, oracle: bigint, bot: string) =>
  call(al, "oracle", oracle, s, "set_authorized_updater", [bot]);
export const addPool = (al: AlgorandClient, s: string, oracle: bigint, poolId: bigint, price: bigint) =>
  call(al, "oracle", oracle, s, "add_pool", [poolId, price]);
export const removePool = (al: AlgorandClient, s: string, oracle: bigint, poolId: bigint) =>
  call(al, "oracle", oracle, s, "remove_pool", [poolId]);

// ── Pause (admin or guardian to pause; guardian-only to unpause) ──────────────────
export const pauseVault = (al: AlgorandClient, s: string, vault: bigint) => call(al, "vault", vault, s, "pause", []);
export const unpauseVault = (al: AlgorandClient, s: string, vault: bigint) => call(al, "vault", vault, s, "unpause", []);
export const pausePsm = (al: AlgorandClient, s: string, psm: bigint) => call(al, "psm", psm, s, "pause", []);
export const unpausePsm = (al: AlgorandClient, s: string, psm: bigint) => call(al, "psm", psm, s, "unpause", []);

// ── Governance: timelocked repoints (48h) ────────────────────────────────────────
export const proposeLpOracle = (al: AlgorandClient, s: string, vault: bigint, newOracleId: bigint) =>
  call(al, "vault", vault, s, "propose_lp_oracle", [newOracleId]);
export const confirmLpOracle = (al: AlgorandClient, s: string, vault: bigint) =>
  call(al, "vault", vault, s, "confirm_lp_oracle", []);
export const cancelLpOracle = (al: AlgorandClient, s: string, vault: bigint) =>
  call(al, "vault", vault, s, "cancel_pending_lp_oracle", []);
export const proposeVaultContract = (al: AlgorandClient, s: string, psm: bigint, newVaultId: bigint) =>
  call(al, "psm", psm, s, "propose_vault_contract", [newVaultId]);
export const confirmVaultContract = (al: AlgorandClient, s: string, psm: bigint) =>
  call(al, "psm", psm, s, "confirm_vault_contract", []);
export const cancelVaultContract = (al: AlgorandClient, s: string, psm: bigint) =>
  call(al, "psm", psm, s, "cancel_pending_vault_contract", []);

// ── Governance: role rotation (2-step) ───────────────────────────────────────────
export const proposeAdmin = (al: AlgorandClient, s: string, which: Which, appId: bigint, newAdmin: string) =>
  call(al, which, appId, s, "propose_admin", [newAdmin]);
export const acceptAdmin = (al: AlgorandClient, s: string, which: Which, appId: bigint) =>
  call(al, which, appId, s, "accept_admin", []);
export const proposeGuardian = (al: AlgorandClient, s: string, which: Which, appId: bigint, newGuardian: string) =>
  call(al, which, appId, s, "propose_guardian", [newGuardian]);
export const acceptGuardian = (al: AlgorandClient, s: string, which: Which, appId: bigint) =>
  call(al, which, appId, s, "accept_guardian", []);
