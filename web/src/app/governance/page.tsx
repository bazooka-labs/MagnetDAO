"use client";

import { Card, SectionHeader } from "@/components/ui";
import {
  Calendar,
  CheckCircle,
  FileText,
  Scale,
  Shield,
  Users,
  Vote,
} from "lucide-react";

export default function GovernancePage() {
  const phases = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Proposal Submission",
      description:
        "Projects apply for liquidity support using the formal proposal template. Each must include project name, liquidity pair, capital requested, expected market impact, timeline, and known risks.",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Community Discussion",
      description:
        "Submitted projects are discussed openly in the MagnetDAO Discord. Members can ask questions, raise concerns, and build consensus before any vote.",
    },
    {
      icon: <Vote className="h-5 w-5" />,
      title: "Official Vote",
      description:
        "At the end of each quarter, eligible proposals go to an official on-chain vote. Voting is weighted at 1 Magnet = 1 Vote.",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Liquidity Deployment",
      description:
        "Winning proposals receive treasury-backed liquidity. Treasury acquires the project token and pairs it with Magnet in a liquidity pool on the selected DEX.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        title="Governance"
        subtitle="How MagnetDAO governance works — quarterly cycles, voting rules, and founder authority"
      />

      {/* Quarterly Cycle */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-magnet-400" />
          Quarterly Cycle
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {phases.map((phase, i) => (
            <Card key={phase.title} className="relative">
              <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-magnet-600 text-white text-sm font-bold">
                {i + 1}
              </div>
              <div className="mb-3 mt-2 flex h-10 w-10 items-center justify-center rounded-lg bg-magnet-600/10 text-magnet-400">
                {phase.icon}
              </div>
              <h4 className="font-semibold text-white">{phase.title}</h4>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                {phase.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Voting Rules */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Scale className="h-5 w-5 text-magnet-400" />
          Voting Rules
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h4 className="font-medium text-white mb-2">Mechanism</h4>
            <p className="text-sm text-gray-400">
              1 Magnet = 1 Vote. Token-weighted voting ensures those with the
              most exposure have the most influence — and the most at risk.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Eligibility</h4>
            <p className="text-sm text-gray-400">
              Any wallet holding Magnet tokens at the time of the vote may
              participate. No minimum holding required.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Timing</h4>
            <p className="text-sm text-gray-400">
              Official votes are held at the end of each quarter, after the
              discussion phase concludes in Discord.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Accountability</h4>
            <p className="text-sm text-gray-400">
              Larger holders carry more influence but also bear more downside if
              they support low-quality projects — creating built-in
              accountability.
            </p>
          </div>
        </div>
      </Card>

      {/* Founder Authority */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-magnet-400" />
          Founder Authority
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          MagnetDAO is a founder-led system. The Founder holds final approval
          authority over all liquidity decisions. This authority exists to:
        </p>
        <ul className="space-y-2">
          {[
            "Protect the token's value from low-quality or misaligned deployments",
            "Ensure treasury capital is deployed responsibly",
            "Maintain operational stability during the DAO's early development",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-gray-400"
            >
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-magnet-500" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          As the DAO matures and governance mechanisms strengthen, founder
          involvement in day-to-day decisions is expected to decrease while the
          proposal and voting system takes on greater autonomy.
        </p>
      </Card>

      {/* No Proposals */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          When No Projects Apply
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg bg-surface border border-gray-800 p-4">
            <h4 className="font-medium text-white mb-2">Rollover</h4>
            <p className="text-sm text-gray-400">
              Treasury funds accumulated that quarter roll over into the
              following quarter's deployment pool. No funds are lost.
            </p>
          </div>
          <div className="rounded-lg bg-surface border border-gray-800 p-4">
            <h4 className="font-medium text-white mb-2">
              Founder Nomination
            </h4>
            <p className="text-sm text-gray-400">
              The Founder may manually nominate projects for community
              consideration, which then follow the standard discussion and
              voting process.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
