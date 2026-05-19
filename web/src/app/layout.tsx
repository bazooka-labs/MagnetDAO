import type { Metadata } from "next";
import { WalletProvider } from "@/hooks/useWallet";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magnet Strategies — Algorand Liquidity",
  description:
    "Magnet Strategies is an Algorand-native liquidity portfolio. Home of the Magnet token ($U) and MagnetDAO — founder-guided liquidity, governance, and fee generation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface text-gray-100 antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
