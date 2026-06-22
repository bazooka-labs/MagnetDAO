"use client";

import { type ReactNode } from "react";

/** Glassy panel with the brand's top gradient hairline (matches the landing cards). */
export function Panel({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-xl shadow-black/40 ${
        glow ? "glow-blue" : ""
      } ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magnet-500/60 to-transparent" />
      {children}
    </div>
  );
}

export function SoonBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-magnet-500/30 bg-magnet-500/10 px-2.5 py-0.5 text-xs font-medium text-magnet-300">
      Coming soon
    </span>
  );
}

export function LaunchingBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse-slow" />
      Launching first
    </span>
  );
}

/** Two overlapping token chips representing an LP pair. */
export function PairGlyph({ tokens }: { tokens: [string, string] }) {
  return (
    <div className="flex shrink-0 items-center">
      <span className="z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-magnet-500 to-magnet-700 text-[10px] font-bold text-white shadow-md">
        {tokens[0].replace("$", "")}
      </span>
      <span className="-ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface-lighter text-[10px] font-bold text-gray-200 shadow-md">
        {tokens[1]}
      </span>
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "purple";
}) {
  const valueColor =
    accent === "green" ? "text-green-400" : accent === "purple" ? "text-magnet-300" : "text-white";
  return (
    <Panel className="p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-bold ${valueColor}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </Panel>
  );
}

/** Primary gradient button, used across the v2 surfaces. */
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl bg-gradient-to-r from-magnet-600 to-magnet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-magnet-900/40 transition-all hover:from-magnet-500 hover:to-magnet-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:from-magnet-600 disabled:hover:to-magnet-500 ${className}`}
    >
      {children}
    </button>
  );
}

export function NotLiveNote() {
  return (
    <p className="mt-3 text-center text-xs text-gray-500">
      On-chain actions unlock when the v2 contracts go live on mainnet.
    </p>
  );
}
