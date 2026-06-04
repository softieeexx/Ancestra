"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ModeId } from "@/lib/constants";

interface LegendCardProps {
  mode: ModeId;
  index: number;
}

const LEGENDS: Record<
  ModeId,
  {
    title: string;
    subtitle: string;
    description: string;
    color: string;
    glow: string;
    ring: string;
    image: string;
    dot: string;
  }
> = {
  amina: {
    title: "Amina",
    subtitle: "Stable Mode",
    description: "Swap RITUAL for stablecoins",
    color: "#4ADE80",
    glow: "rgba(74,222,128,0.18)",
    ring: "rgba(74,222,128,0.35)",
    image: "/legends/amina.jpeg",
    dot: "#4ADE80",
  },
  nefertiti: {
    title: "Nefertiti",
    subtitle: "Crypto Mode",
    description: "Swap RITUAL for major crypto",
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.18)",
    ring: "rgba(251,191,36,0.35)",
    image: "/legends/nefertiti.jpeg",
    dot: "#FBBF24",
  },
  yaa: {
    title: "Yaa Asantewa",
    subtitle: "Alt Mode",
    description: "Swap RITUAL for alt tokens",
    color: "#F87171",
    glow: "rgba(248,113,113,0.18)",
    ring: "rgba(248,113,113,0.35)",
    image: "/legends/yaa.jpeg",
    dot: "#F87171",
  },
};

export default function LegendCard({ mode, index }: LegendCardProps) {
  const router = useRouter();
  const leg = LEGENDS[mode];

  return (
    <button
      onClick={() => router.push(`/swap/${mode}`)}
      className="group relative w-full text-left overflow-hidden rounded-2xl transition-all duration-300 focus:outline-none"
      style={{
        background: "rgba(13,10,3,0.8)",
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        animationDelay: `${index * 100}ms`,
      }}
      aria-label={`Enter ${leg.title} — ${leg.subtitle}`}
    >
      {/* ── Image hero ──────────────────────────────────── */}
      <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
        <Image
          src={leg.image}
          alt={leg.title}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          priority={index === 0}
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Dark bottom fade so text is readable */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(13,10,3,0.97) 0%, rgba(13,10,3,0.55) 40%, rgba(13,10,3,0.0) 70%)",
          }}
        />

        {/* Colored glow at bottom */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse 80% 40% at 50% 100%, ${leg.glow} 0%, transparent 70%)`,
          }}
        />

        {/* Colored ring on hover */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 0 1.5px ${leg.ring}` }}
        />

        {/* ── Text overlay ──────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Mode badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
            style={{
              background: `${leg.color}18`,
              border: `1px solid ${leg.color}40`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: leg.dot }}
            />
            <span
              className="text-xs font-rajdhani font-semibold tracking-widest uppercase"
              style={{ color: leg.color, fontSize: "0.62rem", letterSpacing: "0.18em" }}
            >
              {leg.subtitle}
            </span>
          </div>

          {/* Legend name */}
          <h3
            className="font-cinzel font-bold text-white mb-1 leading-tight"
            style={{ fontSize: "clamp(1.25rem, 3vw, 1.6rem)" }}
          >
            {leg.title}
          </h3>

          {/* Descriptor */}
          <p
            className="text-xs leading-relaxed opacity-50 group-hover:opacity-80 transition-opacity"
            style={{ fontFamily: "Inter, sans-serif", color: "#F5E6C8" }}
          >
            {leg.description}
          </p>

          {/* Enter arrow */}
          <div
            className="flex items-center gap-2 mt-3 text-xs font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
            style={{ color: leg.color, fontSize: "0.65rem", letterSpacing: "0.18em" }}
          >
            <span>Enter</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
