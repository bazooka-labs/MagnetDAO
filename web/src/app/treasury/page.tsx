"use client";

import { Card, SectionHeader, StatCard, StatusBadge } from "@/components/ui";
import { MAGNET_TOKEN } from "@/lib/constants";
import type { Deployment } from "@/types/dao";
import { DEPLOYMENT_STATUSES, DeploymentStatus } from "@/types/dao";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Clock,
} from "lucide-react";

const MOCK_DEPLOYMENTS: Deployment[] = [
  {
    id: 1,
    proposalId: 1,
    projectAsaId: 1234567890,
    amount: 50000,
    dexName: "TinyMan",
    deployer: "FOUNDERADDR123456789",
    status: DeploymentStatus.ACTIVE,
    timestamp: Date.now() - 86400000 * 10,
  },
];

export default function TreasuryPage() {
  const treasuryStats = {
    totalFunded: 250000,
    totalDeployed: 50000,
    availableBalance: 200000,
    totalPools: 1,
    feeEarnings: 1247.83,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        title="Treasury"
        subtitle="Track treasury funds, liquidity deployments, and fee earnings"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <StatCard
          label="Total Funded"
          value={`${treasuryStats.totalFunded.toLocaleString()} ALGO`}
          sublabel="From Bazooka Labs revenue"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Total Deployed"
          value={`${treasuryStats.totalDeployed.toLocaleString()} ALGO`}
          sublabel="Across active pools"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Available Balance"
          value={`${treasuryStats.availableBalance.toLocaleString()} ALGO`}
          sublabel="Ready for deployment"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Active Pools"
          value={String(treasuryStats.totalPools)}
          sublabel="Liquidity positions"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard
          label="Fee Earnings"
          value={`${treasuryStats.feeEarnings.toLocaleString()} ALGO`}
          sublabel="Cumulative swap fees"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Magnet Token"
          value={MAGNET_TOKEN.ticker}
          sublabel={`ASA ${MAGNET_TOKEN.asaId}`}
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
      </div>

      {/* Funding Chart Placeholder */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Treasury Balance Over Time
        </h3>
        <div className="h-48 rounded-lg bg-surface flex items-center justify-center border border-dashed border-gray-700">
          <div className="text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">
              Chart visualization — connect to Algorand indexer for live data
            </p>
          </div>
        </div>
      </Card>

      {/* Active Deployments */}
      <SectionHeader
        title="Active Deployments"
        subtitle="Current liquidity positions across DEXs"
      />

      <div className="space-y-4">
        {MOCK_DEPLOYMENTS.map((deployment) => (
          <Card key={deployment.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-white">
                    Pool #{deployment.id}
                  </h3>
                  <StatusBadge
                    status={DEPLOYMENT_STATUSES[deployment.status]}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {deployment.amount.toLocaleString()} ALGO deployed
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {deployment.dexName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(deployment.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <a
                href={`https://lora.algokit.io/testnet/transaction/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-magnet-400 hover:text-magnet-300 transition-colors"
              >
                View on-chain →
              </a>
            </div>
          </Card>
        ))}
      </div>

      {/* Quarterly Summary */}
      <Card className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Quarterly Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-3 text-left font-medium text-gray-400">
                  Quarter
                </th>
                <th className="py-3 text-left font-medium text-gray-400">
                  Funded
                </th>
                <th className="py-3 text-left font-medium text-gray-400">
                  Deployed
                </th>
                <th className="py-3 text-left font-medium text-gray-400">
                  Proposals
                </th>
                <th className="py-3 text-left font-medium text-gray-400">
                  Fees Earned
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 text-white font-mono">Q1 2026</td>
                <td className="py-3 text-gray-300">250,000 ALGO</td>
                <td className="py-3 text-gray-300">50,000 ALGO</td>
                <td className="py-3 text-gray-300">4 submitted, 1 deployed</td>
                <td className="py-3 text-green-400">1,247.83 ALGO</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
