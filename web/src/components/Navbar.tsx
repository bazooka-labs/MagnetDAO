"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { Magnet, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { address, isConnected, isConnecting, connect, disconnect } =
    useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/proposals", label: "Proposals" },
    { href: "/treasury", label: "Treasury" },
    { href: "/governance", label: "Governance" },
  ];

  function truncateAddress(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/60 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-magnet-500 to-magnet-700">
              <Magnet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white group-hover:text-magnet-400 transition-colors">
              MagnetDAO
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block rounded-full bg-surface-lighter px-3 py-1.5 text-xs font-mono text-magnet-400">
                  {truncateAddress(address!)}
                </span>
                <button
                  onClick={disconnect}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-surface-lighter hover:text-white transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-magnet-600/20 hover:from-magnet-500 hover:to-magnet-400 transition-all disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 text-gray-400 hover:text-white hover:bg-surface-lighter"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-gray-400 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
