"use client";

import { AboutModal } from "@/components/AboutModal";
import { WalletButton } from "@/components/WalletButton";

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Layered background: dark gradient + blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0010]/80 via-[#0d0018]/70 to-black/50 backdrop-blur-md" />

      {/* Bottom glow line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-magnet-500/60 to-transparent" />

      {/* Ambient purple glow anchored to the centre */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-8 bg-magnet-600/20 blur-3xl rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Left: About */}
        <AboutModal />

        {/* Right: Wallet */}
        <WalletButton />
      </div>
    </header>
  );
}
