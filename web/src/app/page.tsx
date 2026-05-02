import Link from "next/link";
import { StatCard } from "@/components/ui";
import { MAGNET_TOKEN } from "@/lib/constants";
import { HeroCTA } from "@/components/HeroCTA";
import { LiveStats } from "@/components/LiveStats";
import { ArrowRight, BarChart3, Lock, Vote, Wallet, Zap } from "lucide-react";

export default function HomePage() {

  const features = [
    {
      icon: <Vote className="h-6 w-6" />,
      title: "Quarterly Governance",
      description:
        "Vote on liquidity proposals each quarter. 1 Magnet = 1 Vote.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Treasury-Backed Liquidity",
      description:
        "Treasury deploys liquidity to winning proposals on selected DEXs.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fee Generation",
      description:
        "Swap fees accrue to liquidity providers across all Magnet pools.",
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Founder Oversight",
      description:
        "Founder retains final approval authority to protect token value.",
    },
  ];

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-magnet-950/40 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-magnet-600/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-magnet-700/30 bg-magnet-900/20 px-4 py-1.5 text-xs font-medium text-magnet-400 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-magnet-500 animate-pulse-slow" />
              Algorand Liquidity DAO
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              <span className="glow-text">Magnet</span>DAO
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
              A founder-guided liquidity DAO on Algorand. Magnet ($U) serves as
              both the governance token and the base asset in all liquidity
              pools — connecting voting power, treasury deployment, and fee
              generation.
            </p>

            <div className="mx-auto mt-10 max-w-3xl w-full">
              <LiveStats />
            </div>

            <HeroCTA />
          </div>
        </div>
      </section>

      {/* Token Stats */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Token"
            value={MAGNET_TOKEN.ticker}
            sublabel={MAGNET_TOKEN.name}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            label="ASA ID"
            value={String(MAGNET_TOKEN.asaId)}
            sublabel="Algorand Standard Asset"
            icon={<Lock className="h-5 w-5" />}
          />
          <StatCard
            label="Total Supply"
            value={MAGNET_TOKEN.totalSupply.toLocaleString()}
            sublabel="Progressive distribution"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatCard
            label="Network"
            value="Algorand"
            sublabel="Pure Proof of Stake"
            icon={<Zap className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
          <p className="mt-2 text-sm text-gray-400">
            Quarterly governance cycle
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "1", title: "Submit", desc: "Projects submit liquidity proposals each quarter" },
            { step: "2", title: "Discuss", desc: "Community discusses proposals in Discord" },
            { step: "3", title: "Vote", desc: "Magnet holders vote at end of quarter" },
            { step: "4", title: "Deploy", desc: "Treasury deploys liquidity to winners" },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-gray-800/60 bg-surface-light p-6 text-center hover:border-magnet-700/30 transition-colors"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-magnet-600/10 text-magnet-400 text-lg font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Built for Algorand</h2>
          <p className="mt-2 text-sm text-gray-400">
            Solving low liquidity through community governance
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-800/60 bg-surface-light p-6 hover:border-gray-700/60 transition-colors"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-magnet-600/10 text-magnet-400">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-magnet-800/30 bg-gradient-to-r from-magnet-950/50 to-surface-light p-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            Join the Governance
          </h2>
          <p className="mt-3 text-gray-400 max-w-xl mx-auto">
            Connect your wallet to participate in quarterly votes and shape the
            future of Algorand liquidity.
          </p>
          <Link
            href="/governance"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 px-8 py-3 text-sm font-semibold text-white hover:from-magnet-500 hover:to-magnet-400 transition-all"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
