"use client";

import { useState } from "react";

export interface ChartPoint {
  date: string;    // "YYYY-MM-DD"
  balance: number; // USDC display units
}

const W = 800;
const H = 220;
const PAD = { top: 20, right: 24, bottom: 36, left: 72 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

function fmtUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtDate(d: string): string {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

export function TreasuryChart({ data }: { data: ChartPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length < 2) {
    return (
      <div className="h-52 flex items-center justify-center text-sm text-gray-600">
        Chart will populate as treasury activity grows.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.balance));
  const yMax = maxVal * 1.15 || 1;

  const cx = (i: number) => PAD.left + (i / (data.length - 1)) * CW;
  const cy = (v: number) => PAD.top + (1 - v / yMax) * CH;

  const linePts = data.map((d, i) => `${cx(i)},${cy(d.balance)}`).join(" ");
  const areaPts = `${cx(0)},${PAD.top + CH} ${linePts} ${cx(data.length - 1)},${PAD.top + CH}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((t) => ({
    y: cy(t * yMax),
    label: fmtUSD(t * yMax),
  }));

  const xStep = Math.max(1, Math.floor(data.length / 5));
  const xLabels = data.reduce<{ i: number; d: ChartPoint }[]>((acc, d, i) => {
    if (i === 0 || i % xStep === 0 || i === data.length - 1) acc.push({ i, d });
    return acc;
  }, []);

  const slotW = CW / Math.max(data.length - 1, 1);
  const hoverPoint = hover !== null ? data[hover] : null;

  return (
    <div className="relative w-full select-none" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="#1f2937" strokeWidth="1" />
            <text x={PAD.left - 8} y={t.y} textAnchor="end" dominantBaseline="middle" fill="#4b5563" fontSize={10}>
              {t.label}
            </text>
          </g>
        ))}

        <polygon points={areaPts} fill="url(#tGrad)" />

        <polyline
          points={linePts}
          fill="none"
          stroke="#a855f7"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {xLabels.map(({ i, d }) => (
          <text key={i} x={cx(i)} y={H - 6} textAnchor="middle" fill="#4b5563" fontSize={9}>
            {fmtDate(d.date)}
          </text>
        ))}

        {data.map((_, i) => (
          <rect
            key={i}
            x={cx(i) - slotW / 2}
            y={PAD.top}
            width={slotW}
            height={CH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {hover !== null && (
          <>
            <line
              x1={cx(hover)} y1={PAD.top}
              x2={cx(hover)} y2={PAD.top + CH}
              stroke="#a855f7" strokeWidth="1" strokeDasharray="3 2" opacity="0.4"
            />
            <circle cx={cx(hover)} cy={cy(data[hover].balance)} r={3.5} fill="#a855f7" />
          </>
        )}
      </svg>

      {hoverPoint !== null && hover !== null && (
        <div
          className="pointer-events-none absolute top-4 z-10 rounded-lg border border-gray-700 bg-gray-950/95 px-3 py-2 text-xs shadow-xl"
          style={{
            left: `${(cx(hover) / W) * 100}%`,
            transform: hover > data.length * 0.65 ? "translateX(-110%)" : "translateX(8%)",
          }}
        >
          <p className="font-semibold text-white">
            ${hoverPoint.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-0.5 text-gray-500">{fmtDate(hoverPoint.date)}</p>
        </div>
      )}
    </div>
  );
}
