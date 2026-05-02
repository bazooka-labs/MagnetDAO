import type { Metadata } from "next";
import { WalletProvider } from "@/hooks/useWallet";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "MagnetDAO — Algorand Liquidity DAO",
  description:
    "MagnetDAO is a founder-guided Algorand liquidity DAO. Magnet ($U) powers governance, liquidity growth, and fee generation across the Algorand ecosystem.",
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
          <Navbar />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
