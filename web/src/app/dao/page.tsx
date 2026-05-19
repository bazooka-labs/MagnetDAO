import Image from "next/image";
import { HeroCTA } from "@/components/HeroCTA";
import { LiveStats } from "@/components/LiveStats";

export default function HomePage() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        {/* Background artwork */}
        <div className="absolute inset-0">
          <Image src="/magnet-bg.png" fill alt="" className="object-cover object-center opacity-10" priority />
        </div>
        {/* Dark overlay + purple tint */}
        <div className="absolute inset-0 bg-surface/75" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-magnet-600/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-16 sm:px-6 lg:px-8 lg:pt-24">
          <div className="text-center">

            {/* Magnet logo — glowing centerpiece */}
            <div className="flex justify-center mb-8">
              <Image
                src="/magnet-logo.png"
                alt="Magnet"
                width={275}
                height={275}
                className="animate-float magnet-glow-pulse"
                priority
              />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              <span className="glow-text">MagnetDAO</span>
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
