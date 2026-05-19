import { Card, SectionHeader } from "@/components/ui";
import { MAGNET_TOKEN } from "@/lib/constants";
import { ClaimFounderButton } from "@/components/ClaimFounderButton";
import {
  Calendar,
  CheckCircle,
  ExternalLink,
  FileText,
  Scale,
  Shield,
  Users,
  Vote,
} from "lucide-react";

const TINYMAN_SWAP_URL =
  "https://app.tinyman.org/swap?asset_in=31566704&asset_out=3081853135";

// ─── Data fetching ─────────────────────────────────────────────────────────

async function fetchHolderCount(): Promise<string> {
  try {
    let count = 0;
    let nextToken: string | undefined;
    do {
      const params = new URLSearchParams({ "currency-greater-than": "0", limit: "1000" });
      if (nextToken) params.set("next", nextToken);
      const res = await fetch(
        `https://mainnet-idx.algonode.cloud/v2/assets/${MAGNET_TOKEN.asaId}/balances?${params}`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) break;
      const data = await res.json();
      count += (data.balances as unknown[])?.length ?? 0;
      nextToken = data["next-token"] as string | undefined;
    } while (nextToken);
    return count.toLocaleString("en-US");
  } catch {
    return "—";
  }
}

async function fetchMagnetPriceUSDC(): Promise<string> {
  try {
    const [vestigeRes, algoRes] = await Promise.all([
      fetch(
        `https://api.vestigelabs.org/assets/price?asset_ids=${MAGNET_TOKEN.asaId}&network_id=0`,
        { next: { revalidate: 300 } }
      ),
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd",
        { next: { revalidate: 300 } }
      ),
    ]);
    if (!vestigeRes.ok || !algoRes.ok) return "—";
    const vestigeData = await vestigeRes.json();
    const algoData = await algoRes.json();
    const entry = Array.isArray(vestigeData) ? vestigeData[0] : null;
    if (!entry?.price) return "—";
    const algoUSD = algoData?.algorand?.usd;
    if (!algoUSD) return "—";
    const priceUSDC = Number(entry.price) * Number(algoUSD);
    return `$${priceUSDC.toFixed(6)}`;
  } catch {
    return "—";
  }
}

// ─── Token Info Card (shared style) ─────────────────────────────────────────

function TokenCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-xl border border-magnet-500/30 bg-gradient-to-br from-magnet-950/60 to-surface-light p-6 transition-all hover:border-magnet-500/50"
      style={{ boxShadow: "0 0 24px rgba(168,85,247,0.10), inset 0 0 32px rgba(168,85,247,0.04)" }}
    >
      <div className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-magnet-500/50 to-transparent" />
      <p className="text-sm font-bold uppercase tracking-widest text-white mb-4">{label}</p>
      {children}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function GovernancePage() {
  const [holderCount, magnetPrice] = await Promise.all([
    fetchHolderCount(),
    fetchMagnetPriceUSDC(),
  ]);

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

      {/* Token Info Boxes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-12">

        {/* Box 1: Token Identity */}
        <TokenCard label="Magnet Token">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Ticker</span>
              <span className="text-sm font-bold text-white">$U</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">ASA ID</span>
              <span className="text-sm font-mono font-semibold text-white">
                {MAGNET_TOKEN.asaId}
              </span>
            </div>
          </div>
        </TokenCard>

        {/* Box 2: Supply & Holders */}
        <TokenCard label="Supply & Community">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Total Supply</span>
              <span className="text-sm font-bold text-white">
                {MAGNET_TOKEN.totalSupply.toLocaleString()} $U
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Holders</span>
              <span className="text-sm font-bold text-white">{holderCount}</span>
            </div>
          </div>
        </TokenCard>

        {/* Box 3: Price & Swap */}
        <TokenCard label="Market">
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Price</span>
              <span
                className="text-sm font-bold text-white"
                style={{ textShadow: "0 0 12px rgba(168,85,247,0.4)" }}
              >
                {magnetPrice} <span className="text-gray-400 font-normal">USDC</span>
              </span>
            </div>
          </div>
          <a
            href={TINYMAN_SWAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-magnet-600 to-magnet-500 py-2 text-xs font-semibold text-white hover:from-magnet-500 hover:to-magnet-400 transition-all"
          >
            Swap on TinyMan
            <ExternalLink className="h-3 w-3" />
          </a>
        </TokenCard>

      </div>

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
            <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
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
        <ClaimFounderButton />
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
            <h4 className="font-medium text-white mb-2">Founder Nomination</h4>
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
