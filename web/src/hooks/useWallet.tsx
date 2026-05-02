"use client";

import {
  WalletProvider as UseWalletProvider,
  useWallet as useUseWallet,
  WalletManager,
  WalletId,
  NetworkId,
  type Wallet,
} from "@txnlab/use-wallet-react";
import { type ReactNode, useMemo } from "react";

export function WalletProvider({ children }: { children: ReactNode }) {
  const manager = useMemo(
    () =>
      new WalletManager({
        defaultNetwork: NetworkId.TESTNET,
        networks: {
          [NetworkId.TESTNET]: {
            algod: {
              baseServer: "https://testnet-api.algonode.cloud",
              port: "",
              token: "",
            },
          },
        },
        wallets: [
          WalletId.PERA,
          WalletId.DEFLY,
          WalletId.LUTE,
          WalletId.KIBISIS,
          WalletId.EXODUS,
        ],
      }),
    []
  );

  return (
    <UseWalletProvider manager={manager}>
      {children}
    </UseWalletProvider>
  );
}

export function useWallet() {
  const {
    activeAccount,
    wallets,
    isReady,
    activeAddress,
  } = useUseWallet();

  const isConnecting = wallets?.some((w: Wallet) => w.isActive && !w.isConnected);

  return {
    address: activeAddress ?? null,
    isConnected: !!activeAccount,
    isConnecting: !!isConnecting,
    isReady,
    activeAccount,
    wallets,
    connect: async (walletId?: WalletId) => {
      const wallet = walletId
        ? wallets?.find((w: Wallet) => w.id === walletId)
        : wallets?.[0];
      if (wallet) {
        await wallet.connect();
      }
    },
    disconnect: async () => {
      const wallet = wallets?.find((w: Wallet) => w.isActive);
      if (wallet) {
        await wallet.disconnect();
      }
    },
  };
}
