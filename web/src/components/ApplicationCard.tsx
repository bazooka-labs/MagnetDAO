"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { LiquidityApplication } from "@/types/dao";

function truncateAddress(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ApplicationCard({ app }: { app: LiquidityApplication }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-gray-800/60 bg-surface-light transition-colors hover:border-gray-700/60">
      <button
        className="w-full px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-magnet-600/10 text-xs font-bold text-magnet-400">
              {app.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{app.name}</p>
              <p className="text-xs text-gray-500">
                {app.asaTitle} · ASA {app.asaId.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <span className="hidden sm:block text-xs text-gray-600">
              {formatDate(app.submittedAt)}
            </span>
            {expanded
              ? <ChevronUp className="h-4 w-4 text-gray-600" />
              : <ChevronDown className="h-4 w-4 text-gray-600" />
            }
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800/60 px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1">Description</p>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{app.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1">Contact</p>
              <p className="text-gray-300">{app.contact}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1">Submitted By</p>
              <p className="font-mono text-gray-400 text-xs">{truncateAddress(app.submitter)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1">Date</p>
              <p className="text-gray-300">{formatDate(app.submittedAt)}</p>
            </div>
          </div>

          <a
            href={`https://lora.algokit.io/mainnet/transaction/${app.txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-magnet-400 hover:text-magnet-300 transition-colors"
          >
            View on Algorand <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
