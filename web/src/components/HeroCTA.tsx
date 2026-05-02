"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { ArrowRight } from "lucide-react";

export function HeroCTA() {
  const { isConnected } = useWallet();

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <Link
        href="/proposals"
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-magnet-600/20 hover:from-magnet-500 hover:to-magnet-400 transition-all"
      >
        View Proposals
        <ArrowRight className="h-4 w-4" />
      </Link>
      {!isConnected && (
        <Link
          href="/governance"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-surface-lighter hover:text-white transition-all"
        >
          Learn More
        </Link>
      )}
    </div>
  );
}
