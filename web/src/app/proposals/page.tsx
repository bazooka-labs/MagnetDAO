"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Vote, ChevronRight } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { ApplyModal } from "@/components/ApplyModal";
import { ApplicationCard } from "@/components/ApplicationCard";
import { CreateProposalModal } from "@/components/CreateProposalModal";
import { VotingProposalCard } from "@/components/VotingProposalCard";
import {
  APPLICATION_ADDRESS,
  APPLICATION_NOTE_PREFIX,
  APPLICATION_WINDOW_MONTHS,
  FOUNDER_ADDRESS,
  VOTING_APP_ID,
  INDEXER_URLS,
} from "@/lib/constants";
import type { LiquidityApplication, VotingProposal, VoterRecord } from "@/types/dao";
import algosdk from "algosdk";

// ─── Data fetching ───────────────────────────────────────────────────────────

async function fetchApplications(): Promise<LiquidityApplication[]> {
  if (!APPLICATION_ADDRESS) return [];
  try {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - APPLICATION_WINDOW_MONTHS);
    const noteB64 = btoa(APPLICATION_NOTE_PREFIX);
    const url =
      `${INDEXER_URLS.mainnet}/v2/accounts/${APPLICATION_ADDRESS}/transactions` +
      `?note-prefix=${encodeURIComponent(noteB64)}&after-time=${cutoff.toISOString()}&limit=50`;

    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    return (data.transactions ?? [])
      .map((txn: { id: string; sender: string; "round-time": number; note?: string }) => {
        try {
          const raw = atob(txn.note ?? "");
          if (!raw.startsWith(APPLICATION_NOTE_PREFIX)) return null;
          const jsonStr = raw.slice(APPLICATION_NOTE_PREFIX.length);
          const payload = JSON.parse(jsonStr);
          return {
            txId: txn.id,
            submitter: txn.sender,
            submittedAt: txn["round-time"],
            name: String(payload.name ?? ""),
            asaTitle: String(payload.asaTitle ?? ""),
            asaId: Number(payload.asaId ?? 0),
            description: String(payload.description ?? ""),
            contact: String(payload.contact ?? ""),
          } satisfies LiquidityApplication;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse(); // newest first
  } catch {
    return [];
  }
}

async function fetchVotingProposals(): Promise<VotingProposal[]> {
  if (!VOTING_APP_ID) return [];
  try {
    const res = await fetch(
      `${INDEXER_URLS.mainnet}/v2/applications/${VOTING_APP_ID}/boxes`
    );
    if (!res.ok) return [];
    const data = await res.json();

    const proposalBoxes = (data.boxes ?? []).filter((b: { name: string }) => {
      try {
        return atob(b.name).startsWith("prop_");
      } catch {
        return false;
      }
    });

    const proposals: VotingProposal[] = [];

    for (const box of proposalBoxes) {
      try {
        const boxRes = await fetch(
          `${INDEXER_URLS.mainnet}/v2/applications/${VOTING_APP_ID}/box?name=${encodeURIComponent("b64:" + box.name)}`
        );
        if (!boxRes.ok) continue;
        const boxData = await boxRes.json();
        const bytes = Uint8Array.from(atob(boxData.value), (c) => c.charCodeAt(0));

        const view = new DataView(bytes.buffer);
        const startTime = Number(view.getBigUint64(0));
        const endTime = Number(view.getBigUint64(8));
        const votesA = Number(view.getBigUint64(16));
        const votesB = Number(view.getBigUint64(24));
        const votesC = Number(view.getBigUint64(32));
        const votesD = Number(view.getBigUint64(40));

        const dec = new TextDecoder();
        const question = dec.decode(bytes.slice(48, 176)).replace(/\0/g, "").trim();
        const choiceA = dec.decode(bytes.slice(176, 208)).replace(/\0/g, "").trim();
        const choiceB = dec.decode(bytes.slice(208, 240)).replace(/\0/g, "").trim();
        const choiceC = dec.decode(bytes.slice(240, 272)).replace(/\0/g, "").trim();
        const choiceD = dec.decode(bytes.slice(272, 304)).replace(/\0/g, "").trim();

        const choices = [choiceA, choiceB, choiceC, choiceD].filter(Boolean);
        const votes = [votesA, votesB, votesC, votesD].slice(0, choices.length);

        // Extract proposal ID from box name: "prop_" + uint64 bytes
        const nameBytes = Uint8Array.from(atob(box.name), (c) => c.charCodeAt(0));
        const idView = new DataView(nameBytes.buffer, 5); // skip "prop_" (5 bytes)
        const id = Number(idView.getBigUint64(0));

        proposals.push({ id, question, choices, votes, startTime, endTime });
      } catch {
        // skip malformed box
      }
    }

    return proposals.sort((a, b) => b.startTime - a.startTime);
  } catch {
    return [];
  }
}

async function fetchVoterRecord(
  address: string,
  proposalId: number
): Promise<VoterRecord | null> {
  if (!VOTING_APP_ID || !address) return null;
  try {
    const proposalIdBytes = algosdk.encodeUint64(proposalId);
    const addressBytes = algosdk.decodeAddress(address).publicKey;
    const voteKey = new Uint8Array([
      ...new TextEncoder().encode("vote_"),
      ...proposalIdBytes,
      ...addressBytes,
    ]);
    const b64Key = btoa(String.fromCharCode(...voteKey));

    const res = await fetch(
      `${INDEXER_URLS.mainnet}/v2/applications/${VOTING_APP_ID}/box?name=${encodeURIComponent("b64:" + b64Key)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const bytes = Uint8Array.from(atob(data.value), (c) => c.charCodeAt(0));
    const view = new DataView(bytes.buffer);
    return {
      proposalId,
      choice: Number(view.getBigUint64(0)),
      lockedAmount: Number(view.getBigUint64(8)),
    };
  } catch {
    return null;
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  const { activeAddress } = useWallet();
  const isFounder = Boolean(FOUNDER_ADDRESS && activeAddress === FOUNDER_ADDRESS);

  const [applications, setApplications] = useState<LiquidityApplication[]>([]);
  const [proposals, setProposals] = useState<VotingProposal[]>([]);
  const [voterRecords, setVoterRecords] = useState<Record<number, VoterRecord | null>>({});

  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingVotes, setLoadingVotes] = useState(true);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadApplications = useCallback(async () => {
    setLoadingApps(true);
    setApplications(await fetchApplications());
    setLoadingApps(false);
  }, []);

  const loadProposals = useCallback(async () => {
    setLoadingVotes(true);
    const fetched = await fetchVotingProposals();
    setProposals(fetched);
    setLoadingVotes(false);

    if (activeAddress && fetched.length > 0) {
      const records: Record<number, VoterRecord | null> = {};
      await Promise.all(
        fetched.map(async (p) => {
          records[p.id] = await fetchVoterRecord(activeAddress, p.id);
        })
      );
      setVoterRecords(records);
    }
  }, [activeAddress]);

  useEffect(() => { loadApplications(); }, [loadApplications]);
  useEffect(() => { loadProposals(); }, [loadProposals]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

      {/* ── Section 1: Apply for Liquidity ── */}
      <section className="mb-16">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-magnet-400" />
              <h2 className="text-xl font-bold text-white">Apply for Liquidity</h2>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              Algorand projects can apply for Magnet treasury liquidity. Applications are
              submitted as a signed on-chain transaction and remain visible for{" "}
              {APPLICATION_WINDOW_MONTHS} months.
            </p>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            disabled={!APPLICATION_ADDRESS}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 px-4 py-2 text-sm font-semibold text-white hover:from-magnet-500 hover:to-magnet-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title={!APPLICATION_ADDRESS ? "Applications not yet open" : undefined}
          >
            Apply
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {!APPLICATION_ADDRESS && (
          <div className="mt-4 rounded-lg border border-dashed border-gray-800 px-4 py-3 text-xs text-gray-600">
            Applications will open once the treasury wallet is configured.
          </div>
        )}

        <div className="mt-6 space-y-3">
          {loadingApps ? (
            <ApplicationsSkeleton />
          ) : applications.length === 0 ? (
            APPLICATION_ADDRESS ? (
              <EmptyState
                title="No applications yet"
                description="Be the first Algorand project to apply for Magnet liquidity."
              />
            ) : null
          ) : (
            applications.map((app) => (
              <ApplicationCard key={app.txId} app={app} />
            ))
          )}
        </div>
      </section>

      {/* ── Section 2: Governance Votes ── */}
      <section>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Vote className="h-4 w-4 text-magnet-400" />
              <h2 className="text-xl font-bold text-white">Governance Votes</h2>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              Vote on proposals using your Magnet balance. 1 $U = 1 vote. Tokens are
              locked for the remainder of the 7-day voting window, then returned in full.
            </p>
          </div>
          {isFounder && (
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!VOTING_APP_ID}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-magnet-700/40 bg-magnet-900/10 px-4 py-2 text-sm font-semibold text-magnet-400 hover:bg-magnet-900/20 hover:border-magnet-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title={!VOTING_APP_ID ? "Voting contract not deployed" : undefined}
            >
              + Create Proposal
            </button>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {loadingVotes ? (
            <VotesSkeleton />
          ) : proposals.length === 0 ? (
            <EmptyState
              title="No proposals yet"
              description={
                isFounder
                  ? "Create the first governance proposal using the button above."
                  : "No governance proposals have been created yet."
              }
            />
          ) : (
            proposals.map((p) => (
              <VotingProposalCard
                key={p.id}
                proposal={p}
                voterRecord={voterRecords[p.id] ?? null}
                onRefresh={loadProposals}
              />
            ))
          )}
        </div>
      </section>

      {/* ── Modals ── */}
      {showApplyModal && (
        <ApplyModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => { setShowApplyModal(false); loadApplications(); }}
        />
      )}
      {showCreateModal && (
        <CreateProposalModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); loadProposals(); }}
        />
      )}
    </div>
  );
}

// ─── Skeletons & Empty State ─────────────────────────────────────────────────

function ApplicationsSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-gray-800/60 bg-surface-light px-5 py-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-800" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-gray-800" />
              <div className="h-2.5 w-20 rounded bg-gray-800/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VotesSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-gray-800/60 bg-surface-light p-6 animate-pulse">
          <div className="h-4 w-3/4 rounded bg-gray-800 mb-5" />
          <div className="space-y-3">
            {[0, 1].map((j) => (
              <div key={j}>
                <div className="flex justify-between mb-1.5">
                  <div className="h-3 w-24 rounded bg-gray-800" />
                  <div className="h-3 w-8 rounded bg-gray-800" />
                </div>
                <div className="h-2 rounded-full bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-800 px-6 py-10 text-center">
      <p className="font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-sm text-gray-700">{description}</p>
    </div>
  );
}
