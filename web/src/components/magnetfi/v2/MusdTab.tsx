"use client";

import { useState } from "react";
import { ArrowDownUp, ShieldCheck, Scale } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { PROTOCOL_LIVE, PSM_REDEEM_FEE_BPS, pct, formatUsd } from "@/lib/magnetfi";
import { Panel, PrimaryButton, NotLiveNote } from "./shared";

type Mode = "mint" | "redeem";

export function MusdTab() {
  const { isConnected } = useWallet();
  const [mode, setMode] = useState<Mode>("mint");
  const [amount, setAmount] = useState<string>("1000");

  const amt = Math.max(0, Number(amount) || 0);
  const feeRate = PSM_REDEEM_FEE_BPS / 10_000;
  const out = mode === "mint" ? amt : amt * (1 - feeRate);
  const fee = mode === "mint" ? 0 : amt * feeRate;

  const fromAsset = mode === "mint" ? "USDC" : "mUSD";
  const toAsset = mode === "mint" ? "mUSD" : "USDC";

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Swap card */}
      <div className="lg:col-span-3">
        <Panel className="p-6">
          {/* Mode toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
            {(["mint", "redeem"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                  mode === m ? "bg-gradient-to-r from-magnet-600 to-magnet-500 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {m === "mint" ? "Mint mUSD" : "Redeem mUSD"}
              </button>
            ))}
          </div>

          {/* From */}
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
            You pay
          </label>
          <div className="flex items-center rounded-xl border border-white/10 bg-black/40 px-4 focus-within:border-magnet-500/50">
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent px-1 py-3.5 font-mono text-xl text-white outline-none"
              placeholder="0"
            />
            <span className="rounded-lg bg-surface-lighter px-3 py-1.5 text-sm font-semibold text-white">
              {fromAsset}
            </span>
          </div>

          {/* Swap arrow */}
          <div className="my-2 flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-magnet-300">
              <ArrowDownUp className="h-4 w-4" />
            </div>
          </div>

          {/* To */}
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
            You receive
          </label>
          <div className="flex items-center rounded-xl border border-white/10 bg-black/30 px-4">
            <input
              readOnly
              value={out ? formatUsd(out) : "0.00"}
              className="w-full bg-transparent px-1 py-3.5 font-mono text-xl text-white outline-none"
            />
            <span className="rounded-lg bg-surface-lighter px-3 py-1.5 text-sm font-semibold text-white">
              {toAsset}
            </span>
          </div>

          {/* Details */}
          <div className="mt-5 space-y-2 rounded-xl border border-white/5 bg-black/20 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Rate</span>
              <span className="font-mono text-white">1 {fromAsset} = 1 {toAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fee</span>
              <span className="font-mono text-white">
                {mode === "mint" ? "0%" : `${pct(PSM_REDEEM_FEE_BPS)}%`}
                {fee > 0 && <span className="text-gray-500"> · {formatUsd(fee)} USDC</span>}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <PrimaryButton disabled={!PROTOCOL_LIVE}>
              {!isConnected
                ? "Connect wallet"
                : PROTOCOL_LIVE
                ? mode === "mint"
                  ? "Mint mUSD"
                  : "Redeem mUSD"
                : "Launching on mainnet soon"}
            </PrimaryButton>
            {!PROTOCOL_LIVE && <NotLiveNote />}
          </div>
        </Panel>
      </div>

      {/* Peg explainer */}
      <div className="space-y-4 lg:col-span-2">
        <Panel className="p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-magnet-600 to-magnet-800 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-white">Backed 1:1 by USDC</p>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
            Every mUSD in circulation is covered by USDC held in the Peg Stability Module. The
            protocol can never mint more mUSD than its USDC reserve backs.
          </p>
        </Panel>
        <Panel className="p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-magnet-600 to-magnet-800 text-white">
            <Scale className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-white">Always redeemable</p>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
            Mint with USDC at no fee, or redeem mUSD back to USDC any time for a flat{" "}
            {pct(PSM_REDEEM_FEE_BPS)}%. The two-way peg keeps mUSD anchored at $1.00.
          </p>
        </Panel>
      </div>
    </div>
  );
}
