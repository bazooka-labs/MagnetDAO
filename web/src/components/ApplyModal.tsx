"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import algosdk from "algosdk";
import {
  APPLICATION_ADDRESS,
  APPLICATION_FEE,
  APPLICATION_NOTE_PREFIX,
  ALGOD_URLS,
} from "@/lib/constants";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const FIELD_LIMITS = {
  name: 64,
  asaTitle: 32,
  description: 1000,
  contact: 128,
};

export function ApplyModal({ onClose, onSuccess }: Props) {
  const { activeAddress, signTransactions, algodClient } = useWallet();

  const [form, setForm] = useState({
    name: "",
    asaTitle: "",
    asaId: "",
    description: "",
    contact: "",
  });
  const [status, setStatus] = useState<"idle" | "signing" | "confirming" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedTxId, setConfirmedTxId] = useState("");

  const isReady =
    APPLICATION_ADDRESS &&
    activeAddress &&
    form.name.trim() &&
    form.asaTitle.trim() &&
    form.asaId.trim() &&
    Number.isInteger(Number(form.asaId)) &&
    Number(form.asaId) > 0 &&
    form.description.trim() &&
    form.contact.trim();

  async function handleSubmit() {
    if (!isReady || !activeAddress) return;
    setStatus("signing");
    setErrorMsg("");

    try {
      const client = algodClient ?? new algosdk.Algodv2("", ALGOD_URLS.mainnet, "");
      const sp = await client.getTransactionParams().do();

      const payload = JSON.stringify({
        name: form.name.trim(),
        asaTitle: form.asaTitle.trim(),
        asaId: Number(form.asaId),
        description: form.description.trim(),
        contact: form.contact.trim(),
      });
      // JSON.stringify produces ASCII-safe output; no extra encoding needed
      const noteStr = APPLICATION_NOTE_PREFIX + payload;
      const note = new TextEncoder().encode(noteStr);

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: APPLICATION_ADDRESS,
        amount: APPLICATION_FEE,
        note,
        suggestedParams: sp,
      });

      const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
      const signed = await signTransactions([encodedTxn]);
      if (!signed?.[0]) throw new Error("Transaction signing cancelled.");

      setStatus("confirming");
      const result = await client.sendRawTransaction(signed[0]).do();
      await algosdk.waitForConfirmation(client, result.txid, 4);

      setConfirmedTxId(result.txid);
      setStatus("done");
      onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Submission failed.");
      setStatus("error");
    }
  }

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-black/30 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-magnet-500 focus:outline-none focus:ring-1 focus:ring-magnet-500";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-magnet-500/20 bg-gray-950 shadow-2xl overflow-hidden">
        {/* Top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magnet-500/50 to-transparent" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Apply for Magnet Liquidity</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Requires an Algorand wallet signature + 0.001 ALGO network fee
              </p>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {status === "done" ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30">
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <p className="text-white font-semibold">Application Submitted</p>
              <p className="mt-1 text-sm text-gray-400">
                Your application is now publicly visible on-chain.
              </p>
              {confirmedTxId && (
                <a
                  href={`https://lora.algokit.io/mainnet/transaction/${confirmedTxId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-magnet-400 hover:text-magnet-300"
                >
                  View on Algorand <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button
                onClick={onClose}
                className="mt-6 block w-full rounded-lg border border-gray-700 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {!APPLICATION_ADDRESS && (
                <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-400">
                  Applications are not yet open. Check back soon.
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. CompX Finance"
                      maxLength={FIELD_LIMITS.name}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1 text-right text-xs text-gray-700">{form.name.length}/{FIELD_LIMITS.name}</p>
                  </div>
                  <div>
                    <label className={labelClass}>ASA Title</label>
                    <input
                      type="text"
                      placeholder="e.g. COMPX"
                      maxLength={FIELD_LIMITS.asaTitle}
                      value={form.asaTitle}
                      onChange={(e) => set("asaTitle", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>ASA ID</label>
                  <input
                    type="number"
                    placeholder="e.g. 796425061"
                    value={form.asaId}
                    onChange={(e) => set("asaId", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Project Description</label>
                  <textarea
                    rows={4}
                    placeholder="What does your project do, and how would Magnet liquidity benefit both parties?"
                    maxLength={FIELD_LIMITS.description}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-right text-xs text-gray-700">{form.description.length}/{FIELD_LIMITS.description}</p>
                </div>

                <div>
                  <label className={labelClass}>Contact Info</label>
                  <input
                    type="text"
                    placeholder="Discord handle, email, or Twitter/X"
                    maxLength={FIELD_LIMITS.contact}
                    value={form.contact}
                    onChange={(e) => set("contact", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="mt-4 text-xs text-red-400">{errorMsg}</p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!isReady || status === "signing" || status === "confirming"}
                  className="flex-1 rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 py-2.5 text-sm font-semibold text-white hover:from-magnet-500 hover:to-magnet-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === "signing" && "Waiting for signature…"}
                  {status === "confirming" && "Confirming on-chain…"}
                  {(status === "idle" || status === "error") && "Submit Application"}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
