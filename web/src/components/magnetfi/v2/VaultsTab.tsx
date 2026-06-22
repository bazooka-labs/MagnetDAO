"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import {
  VAULT_TYPES,
  PROTOCOL_LIVE,
  pct,
  formatUsd,
  maxBorrow,
  healthFactor,
  liquidationBuffer,
  type VaultType,
} from "@/lib/magnetfi";
import { Panel, PairGlyph, SoonBadge, LaunchingBadge, PrimaryButton, NotLiveNote } from "./shared";

function hfColor(hf: number): string {
  if (hf === Infinity) return "text-gray-400";
  if (hf >= 1.5) return "text-green-400";
  if (hf >= 1.15) return "text-yellow-400";
  return "text-red-400";
}

function VaultSelector({
  selected,
  onSelect,
}: {
  selected: VaultType;
  onSelect: (v: VaultType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {VAULT_TYPES.map((v) => {
        const active = v.id === selected.id;
        const disabled = v.status === "soon";
        return (
          <button
            key={v.id}
            onClick={() => !disabled && onSelect(v)}
            disabled={disabled}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
              active
                ? "border-magnet-500/60 bg-magnet-500/10"
                : "border-white/10 bg-black/30 hover:border-white/20"
            } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
          >
            <PairGlyph tokens={v.tokens} />
            <span className="text-sm font-medium text-white">{v.pair}</span>
          </button>
        );
      })}
    </div>
  );
}

function Calculator({ v }: { v: VaultType }) {
  const { isConnected } = useWallet();
  const [collateral, setCollateral] = useState<string>("1000");
  const [borrow, setBorrow] = useState<string>("500");

  const collateralUsd = Math.max(0, Number(collateral) || 0);
  const cap = maxBorrow(collateralUsd, v.ltvBps);
  const borrowMusd = Math.min(Math.max(0, Number(borrow) || 0), cap || 0);

  const hf = useMemo(
    () => healthFactor(collateralUsd, borrowMusd, v.liqThresholdBps),
    [collateralUsd, borrowMusd, v.liqThresholdBps]
  );
  const buffer = useMemo(
    () => liquidationBuffer(collateralUsd, borrowMusd, v.liqThresholdBps),
    [collateralUsd, borrowMusd, v.liqThresholdBps]
  );
  const interestYr = borrowMusd * (v.rateBps / 10_000);
  const utilization = cap > 0 ? (borrowMusd / cap) * 100 : 0;

  return (
    <Panel className="p-6">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
              LP collateral value
            </label>
            <div className="flex items-center rounded-xl border border-white/10 bg-black/40 px-4 focus-within:border-magnet-500/50">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                min={0}
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
                className="w-full bg-transparent px-2 py-3 font-mono text-lg text-white outline-none"
                placeholder="0"
              />
              <span className="text-xs text-gray-500">USD</span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              The USD value of the {v.pair} LP tokens you deposit.
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Borrow mUSD
              </label>
              <button
                onClick={() => setBorrow(String(Math.floor(cap)))}
                className="text-xs font-medium text-magnet-300 hover:text-magnet-200"
              >
                Max {formatUsd(cap, 0)}
              </button>
            </div>
            <div className="flex items-center rounded-xl border border-white/10 bg-black/40 px-4 focus-within:border-magnet-500/50">
              <input
                type="number"
                min={0}
                value={borrow}
                onChange={(e) => setBorrow(e.target.value)}
                className="w-full bg-transparent px-2 py-3 font-mono text-lg text-white outline-none"
                placeholder="0"
              />
              <span className="text-xs text-gray-500">mUSD</span>
            </div>
            {/* utilization bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-magnet-600 to-magnet-400 transition-all"
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              {formatUsd(utilization, 0)}% of your {pct(v.ltvBps)}% borrow limit
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4 rounded-xl border border-white/5 bg-black/20 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Health factor</span>
            <span className={`font-mono text-2xl font-bold ${hfColor(hf)}`}>
              {hf === Infinity ? "∞" : hf.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-3 text-sm">
            <span className="text-gray-400">Liquidation buffer</span>
            <span className="font-mono text-white">
              {borrowMusd > 0 ? `${formatUsd(buffer * 100, 1)}% drop` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Interest / year</span>
            <span className="font-mono text-white">
              {formatUsd(interestYr)} mUSD <span className="text-gray-500">({pct(v.rateBps)}%)</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Liquidation threshold</span>
            <span className="font-mono text-white">{pct(v.liqThresholdBps)}%</span>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/30 px-3 py-2.5">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-magnet-400" />
            <p className="text-xs leading-relaxed text-gray-500">
              Interest-only. Repay principal any time to unlock collateral. Liquidation begins at a
              health factor of 1.00.
            </p>
          </div>

          <PrimaryButton disabled={!PROTOCOL_LIVE}>
            {!isConnected
              ? "Connect wallet to borrow"
              : PROTOCOL_LIVE
              ? `Open ${v.pair} vault`
              : "Launching on mainnet soon"}
          </PrimaryButton>
          {!PROTOCOL_LIVE && <NotLiveNote />}
        </div>
      </div>
    </Panel>
  );
}

export function VaultsTab() {
  const { isConnected } = useWallet();
  const launchable = VAULT_TYPES.find((v) => v.status === "launching") ?? VAULT_TYPES[0];
  const [selected, setSelected] = useState<VaultType>(launchable);

  return (
    <div className="space-y-8">
      {/* Intro */}
      <Panel className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-white">Borrow against your liquidity</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
              Your Tinyman LP tokens keep earning trading fees while they back a mUSD loan. No fixed
              term, interest-only repayment, and you keep your upside.
            </p>
          </div>
          {selected.status === "launching" ? <LaunchingBadge /> : <SoonBadge />}
        </div>
      </Panel>

      {/* Selector */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Choose collateral
        </h3>
        <VaultSelector selected={selected} onSelect={setSelected} />
      </div>

      {/* Calculator / open vault */}
      <Calculator v={selected} />

      {/* Positions */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Your vaults
        </h3>
        <Panel className="p-10">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">
              {isConnected ? "No open vaults yet" : "Connect your wallet to see your vaults"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {PROTOCOL_LIVE
                ? "Open a vault above to start borrowing mUSD."
                : "Vaults open once the v2 contracts are live on mainnet."}
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
