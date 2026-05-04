"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import algosdk from "algosdk";
import { VOTING_APP_ID, MAGNET_TOKEN, ALGOD_URLS } from "@/lib/constants";
import type { VotingProposal } from "@/types/dao";

interface Props {
  proposal: VotingProposal;
  choiceIndex: number;
  magnetBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VoteModal({ proposal, choiceIndex, magnetBalance, onClose, onSuccess }: Props) {
  const { activeAddress, signTransactions, algodClient } = useWallet();
  const [status, setStatus] = useState<"idle" | "signing" | "confirming" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const choiceLabel = proposal.choices[choiceIndex];
  const lockUntil = formatDate(proposal.endTime);

  async function handleVote() {
    if (!activeAddress || magnetBalance === 0) return;
    setStatus("signing");
    setErrorMsg("");

    try {
      const client = algodClient ?? new algosdk.Algodv2("", ALGOD_URLS.mainnet, "");
      const sp = await client.getTransactionParams().do();

      const enc = new TextEncoder();
      const proposalIdBytes = algosdk.encodeUint64(proposal.id);

      // [0] AppCall: cast_vote(proposal_id, choice_index)
      const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: activeAddress,
        appIndex: VOTING_APP_ID,
        appArgs: [
          enc.encode("cast_vote"),
          proposalIdBytes,
          algosdk.encodeUint64(choiceIndex),
        ],
        boxes: [
          { appIndex: VOTING_APP_ID, name: new Uint8Array([...proposalIdBytes, ...algosdk.decodeAddress(activeAddress).publicKey]) },
        ],
        foreignAssets: [MAGNET_TOKEN.asaId],
        suggestedParams: sp,
      });

      // [1] AssetTransfer: lock Magnet tokens in contract
      const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: algosdk.getApplicationAddress(VOTING_APP_ID),
        assetIndex: MAGNET_TOKEN.asaId,
        amount: magnetBalance,
        suggestedParams: sp,
      });

      algosdk.assignGroupID([appCallTxn, transferTxn]);

      const signed = await signTransactions([
        algosdk.encodeUnsignedTransaction(appCallTxn),
        algosdk.encodeUnsignedTransaction(transferTxn),
      ]);
      if (!signed?.[0] || !signed?.[1]) throw new Error("Transaction signing cancelled.");

      setStatus("confirming");
      const result = await client.sendRawTransaction([signed[0], signed[1]]).do();
      await algosdk.waitForConfirmation(client, result.txid, 4);

      setStatus("idle");
      onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Vote failed.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-magnet-500/20 bg-gray-950 shadow-2xl overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magnet-500/50 to-transparent" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Confirm Vote</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-magnet-500/20 bg-magnet-950/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Your Choice</p>
              <p className="text-white font-semibold">{String.fromCharCode(65 + choiceIndex)}. {choiceLabel}</p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-black/20 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Voting power</span>
                <span className="font-semibold text-white">
                  {magnetBalance.toLocaleString()} $U
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Lock className="h-3.5 w-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-400">
                    Your full balance will be locked until the vote closes.
                  </span>
                  <p className="mt-1 text-yellow-400 text-xs font-medium">
                    Unlocks: {lockUntil}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Tokens are returned in full after the vote period ends. You must call "Claim Tokens" to retrieve them.
            </p>
          </div>

          {status === "error" && (
            <p className="mt-4 text-xs text-red-400">{errorMsg}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleVote}
              disabled={magnetBalance === 0 || status === "signing" || status === "confirming"}
              className="flex-1 rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 py-2.5 text-sm font-semibold text-white hover:from-magnet-500 hover:to-magnet-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "signing" && "Waiting for signature…"}
              {status === "confirming" && "Confirming on-chain…"}
              {(status === "idle" || status === "error") && "Lock & Vote"}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
