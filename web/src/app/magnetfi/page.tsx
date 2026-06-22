"use client";

import { useState } from "react";
import { Landmark, Vault, Coins, LayoutGrid } from "lucide-react";
import { PROTOCOL_LIVE } from "@/lib/magnetfi";
import { OverviewTab } from "@/components/magnetfi/v2/OverviewTab";
import { VaultsTab } from "@/components/magnetfi/v2/VaultsTab";
import { MusdTab } from "@/components/magnetfi/v2/MusdTab";

type Tab = "overview" | "borrow" | "musd";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "borrow", label: "Borrow", icon: <Vault className="h-4 w-4" /> },
  { id: "musd", label: "mUSD", icon: <Coins className="h-4 w-4" /> },
];

export default function MagnetFiPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-black/40 px-6 py-8 backdrop-blur-sm sm:px-10 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magnet-500/60 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-magnet-600/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-magnet-600 to-magnet-800 shadow-lg shadow-magnet-900/50">
              <Landmark className="h-7 w-7 text-white drop-shadow" />
            </div>
            <div>
              <h1
                className="glow-text text-3xl font-bold text-white sm:text-4xl"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                MagnetFi
              </h1>
              <p className="mt-1 max-w-xl text-sm text-gray-300">
                Borrow the <span className="font-semibold text-white">mUSD</span> stablecoin against your
                Tinyman LP — your liquidity keeps earning while it works as collateral.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-magnet-500/30 bg-magnet-500/10 px-3 py-1.5 text-xs font-medium text-magnet-200">
            <span className="h-1.5 w-1.5 rounded-full bg-magnet-400 animate-pulse-slow" />
            {PROTOCOL_LIVE ? "Live on Algorand mainnet" : "Mainnet launch incoming"}
          </span>
        </div>
      </div>

      {/* Pre-launch banner */}
      {!PROTOCOL_LIVE && (
        <div className="mb-8 rounded-xl border border-magnet-500/20 bg-magnet-500/5 px-5 py-3.5 text-sm text-magnet-200">
          MagnetFi v2 is in final pre-launch. Explore the vaults and run the numbers below — borrowing
          and minting open as soon as the contracts go live on mainnet.
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "border-magnet-500/60 bg-magnet-500/10 text-white"
                : "border-white/10 bg-black/30 text-gray-400 hover:border-white/20 hover:text-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && <OverviewTab onBorrow={() => setActiveTab("borrow")} />}
      {activeTab === "borrow" && <VaultsTab />}
      {activeTab === "musd" && <MusdTab />}
    </div>
  );
}
