"use client";

import { useState } from "react";
import { Card, SectionHeader, StatusBadge, EmptyState } from "@/components/ui";
import { useWallet } from "@/hooks/useWallet";
import {
  type Proposal,
  ProposalStatus,
  PROPOSAL_STATUSES,
} from "@/types/dao";
import { ArrowUpRight, Calendar, DollarSign, Users } from "lucide-react";

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 1,
    quarter: 1,
    projectName: "TinySwap Protocol",
    liquidityPair: "TINY/U",
    capitalRequested: 50000,
    timelineDays: 90,
    riskHash: "a]b3f8e2",
    submitter: "ADDR1234567890ABCDEF",
    status: ProposalStatus.APPROVED,
    votesFor: 12500,
    votesAgainst: 3200,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 2,
    quarter: 1,
    projectName: "AlgoStable",
    liquidityPair: "STABLE/U",
    capitalRequested: 75000,
    timelineDays: 180,
    riskHash: "c7d91a4b",
    submitter: "ADDR0987654321FEDCBA",
    status: ProposalStatus.VOTING,
    votesFor: 8300,
    votesAgainst: 5100,
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 3,
    quarter: 1,
    projectName: "ChainBridge",
    liquidityPair: "BRIDGE/U",
    capitalRequested: 30000,
    timelineDays: 60,
    riskHash: "e5a2f81c",
    submitter: "ADDR5555555555ABCDE",
    status: ProposalStatus.PENDING,
    votesFor: 0,
    votesAgainst: 0,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 4,
    quarter: 1,
    projectName: "DecentraDAO",
    liquidityPair: "DDAO/U",
    capitalRequested: 45000,
    timelineDays: 90,
    riskHash: "f1b8c3d7",
    submitter: "ADDR1111111111ABCDEF",
    status: ProposalStatus.REJECTED,
    votesFor: 2100,
    votesAgainst: 14000,
    createdAt: Date.now() - 86400000 * 45,
  },
];

export default function ProposalsPage() {
  const { isConnected } = useWallet();
  const [filter, setFilter] = useState<"all" | "active" | "completed">(
    "all"
  );
  const [showSubmit, setShowSubmit] = useState(false);

  // W10: Form state
  const [formName, setFormName] = useState("");
  const [formPair, setFormPair] = useState("");
  const [formCapital, setFormCapital] = useState("");
  const [formTimeline, setFormTimeline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRisks, setFormRisks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // W10: Submit handler
  function handleSubmit() {
    if (!formName || !formPair || !formCapital || !formTimeline) return;
    setSubmitting(true);
    // TODO: construct create_proposal group txn and submit via wallet
    console.log("Proposal submitted:", {
      name: formName,
      pair: formPair,
      capital: parseInt(formCapital),
      timeline: parseInt(formTimeline),
      description: formDescription,
      risks: formRisks,
    });
    setTimeout(() => {
      setSubmitting(false);
      setShowSubmit(false);
      setFormName("");
      setFormPair("");
      setFormCapital("");
      setFormTimeline("");
      setFormDescription("");
      setFormRisks("");
    }, 1000);
  }

  const filteredProposals = MOCK_PROPOSALS.filter((p) => {
    if (filter === "active")
      return [ProposalStatus.PENDING, ProposalStatus.VOTING].includes(
        p.status
      );
    if (filter === "completed")
      return [
        ProposalStatus.APPROVED,
        ProposalStatus.REJECTED,
        ProposalStatus.DEPLOYED,
      ].includes(p.status);
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        title="Proposals"
        subtitle="Review and vote on liquidity proposals for the current quarter"
        action={
          isConnected ? (
            <button
              onClick={() => setShowSubmit(!showSubmit)}
              className="rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 px-4 py-2 text-sm font-semibold text-white hover:from-magnet-500 hover:to-magnet-400 transition-all"
            >
              + New Proposal
            </button>
          ) : null
        }
      />

      {/* Filters */}
      <div className="mb-8 flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              filter === f
                ? "bg-magnet-600/20 text-magnet-400 border border-magnet-600/30"
                : "text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Submit Form */}
      {showSubmit && (
        <Card className="mb-8 border-magnet-700/30">
          <h3 className="text-lg font-semibold text-white mb-6">
            Submit a Proposal
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                placeholder="e.g. TinySwap"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-magnet-500 focus:outline-none focus:ring-1 focus:ring-magnet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Liquidity Pair
              </label>
              <input
                type="text"
                placeholder="e.g. TINY/U"
                value={formPair}
                onChange={(e) => setFormPair(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-magnet-500 focus:outline-none focus:ring-1 focus:ring-magnet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Capital Requested (Algos)
              </label>
              <input
                type="number"
                placeholder="50000"
                value={formCapital}
                onChange={(e) => setFormCapital(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-magnet-500 focus:outline-none focus:ring-1 focus:ring-magnet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Timeline (Days)
              </label>
              <input
                type="number"
                placeholder="90"
                value={formTimeline}
                onChange={(e) => setFormTimeline(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-magnet-500 focus:outline-none focus:ring-1 focus:ring-magnet-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Project Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe your project and how liquidity will improve market conditions..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-magnet-500 focus:outline-none focus:ring-1 focus:ring-magnet-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Known Risks
              </label>
              <textarea
                rows={2}
                placeholder="Honest assessment of risks..."
                value={formRisks}
                onChange={(e) => setFormRisks(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-magnet-500 focus:outline-none focus:ring-1 focus:ring-magnet-500"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || !formName || !formPair || !formCapital}
              className="rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 px-6 py-2 text-sm font-semibold text-white hover:from-magnet-500 hover:to-magnet-400 transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Proposal"}
            </button>
            <button
              onClick={() => setShowSubmit(false)}
              className="rounded-lg border border-gray-700 px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <EmptyState
          title="No proposals found"
          description="No proposals match the current filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const { isConnected } = useWallet();
  const [expanded, setExpanded] = useState(false);
  const [voting, setVoting] = useState(false);
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercent =
    totalVotes > 0 ? Math.round((proposal.votesFor / totalVotes) * 100) : 0;

  // W11: Vote handler
  function handleVote(direction: "for" | "against") {
    if (voting) return;
    setVoting(true);
    // TODO: construct cast_vote group txn and submit via wallet
    console.log(`Vote ${direction} on proposal ${proposal.id}`);
    setTimeout(() => setVoting(false), 1000);
  }

  return (
    <Card className="hover:border-gray-700/60 transition-colors cursor-pointer">
      <div onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                {proposal.projectName}
              </h3>
              <StatusBadge
                status={PROPOSAL_STATUSES[proposal.status]}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {proposal.liquidityPair}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {proposal.capitalRequested.toLocaleString()} Algos
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {proposal.timelineDays} days
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Q{proposal.quarter}
              </span>
            </div>
          </div>
        </div>

        {totalVotes > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{forPercent}% For</span>
              <span>{totalVotes.toLocaleString()} total votes</span>
            </div>
            <div className="h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-magnet-600 to-magnet-400 transition-all"
                style={{ width: `${forPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-6 pt-6 border-t border-gray-800/60">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Submitter</p>
              <p className="font-mono text-gray-300 truncate">
                {proposal.submitter}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Risk Hash</p>
              <p className="font-mono text-gray-300">{proposal.riskHash}</p>
            </div>
          </div>

          {proposal.status === ProposalStatus.VOTING && isConnected && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleVote("for")}
                disabled={voting}
                className="rounded-lg bg-green-600/20 border border-green-600/30 px-6 py-2 text-sm font-semibold text-green-400 hover:bg-green-600/30 transition-all disabled:opacity-50"
              >
                {voting ? "Voting..." : "Vote For"}
              </button>
              <button
                onClick={() => handleVote("against")}
                disabled={voting}
                className="rounded-lg bg-red-600/20 border border-red-600/30 px-6 py-2 text-sm font-semibold text-red-400 hover:bg-red-600/30 transition-all disabled:opacity-50"
              >
                {voting ? "Voting..." : "Vote Against"}
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
