"use client";

import { ModeId, POOLS } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface LegendCardProps {
  mode: ModeId;
  index: number;
}

const legends = {
  amina: {
    title: "Amina",
    subtitle: "Stable Mode",
    description: "The warrior queen who commanded stability. Swap RITUAL for stablecoins.",
    color: "#4ADE80",
    pattern: "◈",
    gradient: "from-emerald-900/40 via-transparent to-emerald-950/20",
  },
  nefertiti: {
    title: "Nefertiti",
    subtitle: "Crypto Mode",
    description: "The queen of influence. Swap RITUAL for major crypto assets.",
    color: "#FBBF24",
    pattern: "◇",
    gradient: "from-amber-900/40 via-transparent to-amber-950/20",
  },
  yaa: {
    title: "Yaa Asantewa",
    subtitle: "Alt Mode",
    description: "The fearless leader. Swap RITUAL for alternative tokens.",
    color: "#F87171",
    pattern: "◆",
    gradient: "from-red-900/40 via-transparent to-red-950/20",
  },
};

export default function LegendCard({ mode, index }: LegendCardProps) {
  const router = useRouter();
  const legend = legends[mode];

  return (
    <button
      onClick={() => router.push(`/swap/${mode}`)}
      className={`
        group relative w-full p-6 rounded-2xl text-left
        bg-gradient-to-br ${legend.gradient}
        border border-ritual/10 hover:border-ritual/30
        transition-all duration-500 glow-card
        animate-slide-up
      `}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Decorative pattern */}
      <div className="absolute top-3 right-4 text-4xl opacity-5 group-hover:opacity-10 transition-opacity select-none"
        style={{ color: legend.color }}>
        {legend.pattern}
      </div>

      {/* Legend number */}
      <div className="text-xs font-mono mb-3" style={{ color: legend.color }}>
        0{index + 1}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-display font-bold text-white mb-1">
        {legend.title}
      </h3>

      {/* Subtitle badge */}
      <div
        className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
        style={{
          color: legend.color,
          backgroundColor: `${legend.color}15`,
          border: `1px solid ${legend.color}30`,
        }}
      >
        {legend.subtitle}
      </div>

      {/* Description */}
      <p className="text-sm text-earth-100/60 group-hover:text-earth-100/80 transition-colors">
        {legend.description}
      </p>

      {/* Arrow */}
      <div className="mt-4 flex items-center gap-2 text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0"
        style={{ color: legend.color }}>
        <span>Enter</span>
        <span>→</span>
      </div>
    </button>
  );
}
