"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Coins, X } from "lucide-react"

const HaystackSwap = dynamic(
  () => import("@/components/HaystackSwap").then((m) => m.HaystackSwap),
  { ssr: false, loading: () => <div className="rounded-xl border border-white/10 bg-black/50 h-48 animate-pulse" /> }
)

interface Props {
  price: string
  holders: string
  tvl: string
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="relative rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm p-4 text-center shadow-lg shadow-black/40">
      <div className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-magnet-500/60 to-transparent" />
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-xl font-bold text-white" style={{ textShadow: "0 0 20px rgba(168,85,247,0.5)" }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

export function TokenTradeModal({ price, holders, tvl }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Card row */}
      <div className="relative w-full rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden flex items-center gap-5 px-6 py-5 shadow-xl shadow-black/50 hover:shadow-magnet-900/30 hover:-translate-y-0.5 transition-all duration-200">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magnet-500/60 to-transparent" />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-magnet-600 to-magnet-800 shrink-0">
          <Coins className="h-7 w-7 text-white drop-shadow-lg" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-base font-semibold text-white">$U Token</p>
          <p className="text-sm text-gray-400">Price, holders, and live trading</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-magnet-900/60 hover:from-magnet-500 hover:to-magnet-400 hover:shadow-lg hover:shadow-magnet-700/40 transition-all duration-150"
        >
          Trade
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Ambient centre glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-64 bg-magnet-700/15 blur-3xl rounded-full pointer-events-none" />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0010]/95 backdrop-blur-xl shadow-2xl shadow-black/80">
            {/* Top glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magnet-500/70 to-transparent rounded-t-2xl" />

            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-magnet-600 to-magnet-800 shrink-0">
                <Coins className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-white">$U Token</p>
                <p className="text-sm text-gray-400">Live stats and trading</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-5">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="$U Price" value={price} sub="USDC" />
                <StatCard label="$U Holders" value={holders} sub="Active wallets" />
                <StatCard label="Total TVL" value={tvl} sub="$U pools via Vestige" />
              </div>

              {/* Chart */}
              <div className="relative w-full rounded-xl border border-white/10 bg-black/50 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px z-10 bg-gradient-to-r from-transparent via-magnet-500/60 to-transparent" />
                <iframe
                  title="Magnet ($U) / ALGO Chart"
                  src="https://vestige.fi/widget/3081853135/chart?noCookie=true&denominatingAssetId=0"
                  className="w-full block"
                  style={{ height: 360, border: "none" }}
                  loading="lazy"
                />
              </div>

              {/* Swap */}
              <HaystackSwap />

            </div>
          </div>
        </div>
      )}
    </>
  )
}
