"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import algosdk from "algosdk";
import { VOTING_APP_ID, ALGOD_URLS, VOTING_NETWORK } from "@/lib/constants";

type Status = "idle" | "signing" | "confirming" | "done" | "error";

type GlobalStateEntry = {
  key: string;
  value: { bytes?: string; uint?: number; type: number };
};

export function ClaimFounderButton() {
  const { activeAddress, isConnected, signTransactions, algodClient } = useWallet();
  const [pendingFounder, setPendingFounder] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchPendingFounder() {
      try {
        const res = await fetch(
          `${ALGOD_URLS[VOTING_NETWORK]}/v2/applications/${VOTING_APP_ID}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const gs: GlobalStateEntry[] = data.params?.["global-state"] ?? [];
        const entry = gs.find((e) => atob(e.key) === "pending_founder");
        if (!entry?.value?.bytes) { setPendingFounder(null); return; }
        const rawBytes = Uint8Array.from(atob(entry.value.bytes), (c) => c.charCodeAt(0));
        if (rawBytes.length !== 32 || rawBytes.every((b) => b === 0)) {
          setPendingFounder(null);
          return;
        }
        setPendingFounder(algosdk.encodeAddress(rawBytes));
      } catch {
        setPendingFounder(null);
      }
    }
    fetchPendingFounder();
  }, []);

  if (!isConnected || !pendingFounder || activeAddress !== pendingFounder) return null;

  if (status === "done") {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-green-600/40 bg-green-900/20 px-4 py-3 text-sm text-green-400">
        <Shield className="h-4 w-4 shrink-0" />
        You are now the Founder of MagnetDAO.
      </div>
    );
  }

  async function handleClaim() {
    if (!activeAddress) return;
    setStatus("signing");
    setErrorMsg("");
    try {
      const client = algodClient ?? new algosdk.Algodv2("", ALGOD_URLS[VOTING_NETWORK], "");
      const sp = await client.getTransactionParams().do();

      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: activeAddress,
        appIndex: VOTING_APP_ID,
        suggestedParams: sp,
        appArgs: [new TextEncoder().encode("accept_founder")],
      });

      const signed = await signTransactions([algosdk.encodeUnsignedTransaction(txn)]);
      if (!signed?.[0]) throw new Error("Transaction signing cancelled.");
      setStatus("confirming");

      const result = await client.sendRawTransaction(signed[0]).do();
      await algosdk.waitForConfirmation(client, result.txid, 4);
      setStatus("done");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Transaction failed");
      setStatus("error");
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-magnet-500/40 bg-magnet-900/20 p-4">
      <p className="text-sm text-magnet-300 mb-3 flex items-center gap-2">
        <Shield className="h-4 w-4 shrink-0" />
        You have been nominated as Founder. Claim your role to activate full founder authority.
      </p>
      {status === "error" && (
        <p className="text-xs text-red-400 mb-3">{errorMsg}</p>
      )}
      <button
        onClick={handleClaim}
        disabled={status === "signing" || status === "confirming"}
        className="rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-magnet-600/20 hover:from-magnet-500 hover:to-magnet-400 transition-all disabled:opacity-50"
      >
        {status === "signing"
          ? "Waiting for signature…"
          : status === "confirming"
          ? "Confirming…"
          : "Claim Founder Role"}
      </button>
    </div>
  );
}
