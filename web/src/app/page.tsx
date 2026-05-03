import { HeroCTA } from "@/components/HeroCTA";
import { LiveStats } from "@/components/LiveStats";

export default function HomePage() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-magnet-950/40 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-magnet-600/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-28">
          <div className="text-center">
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
    </div>
  );
}
