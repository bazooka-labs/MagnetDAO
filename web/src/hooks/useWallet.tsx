"use client";

import { PeraWalletConnect } from "@perawallet/connect";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  peraWallet: PeraWalletConnect | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  peraWallet: null,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const wallet = new PeraWalletConnect({
      shouldShowSignTxnToast: true,
    });
    setPeraWallet(wallet);

    wallet.reconnectSession().then((accounts) => {
      if (accounts.length) {
        setAddress(accounts[0]);
      }
    });

    return () => {
      wallet.disconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    if (!peraWallet) return;
    setIsConnecting(true);
    try {
      const accounts = await peraWallet.connect();
      if (accounts.length) {
        setAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [peraWallet]);

  const disconnect = useCallback(() => {
    if (!peraWallet) return;
    peraWallet.disconnect();
    setAddress(null);
  }, [peraWallet]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        connect,
        disconnect,
        peraWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
