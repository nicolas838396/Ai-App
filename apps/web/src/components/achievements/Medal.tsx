"use client";

import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";

type Metal = "bronze" | "silver" | "gold" | "platinum";

const METAL_STYLES: Record<Metal, { ring: string; disc: string; dark: string }> = {
  bronze: { ring: "#b08968", disc: "#e3b283", dark: "#8c6239" },
  silver: { ring: "#c3c9d1", disc: "#eef1f4", dark: "#9aa3ad" },
  gold: { ring: "#e8b923", disc: "#f7dd85", dark: "#c69413" },
  platinum: { ring: "#7fd3c9", disc: "#d8f5f0", dark: "#4fada1" },
};

// Distributes a category's tiers evenly across the four medal metals, so a
// category with 3 tiers and one with 12 tiers both read as a clear bronze
// -> silver -> gold -> platinum progression.
function metalForTier(tierIndex: number, tierCount: number): Metal {
  if (tierCount <= 1) return "gold";
  const position = tierIndex / (tierCount - 1);
  if (position >= 1) return "platinum";
  if (position >= 0.66) return "gold";
  if (position >= 0.33) return "silver";
  return "bronze";
}

export function Medal({
  icon: Icon,
  tierIndex,
  tierCount,
  unlocked,
  justUnlocked,
  size = 56,
}: {
  icon: LucideIcon;
  tierIndex: number;
  tierCount: number;
  unlocked: boolean;
  justUnlocked?: boolean;
  size?: number;
}) {
  const metal = metalForTier(tierIndex, tierCount);
  const style = METAL_STYLES[metal];

  return (
    <div
      className={`relative shrink-0 ${justUnlocked ? "medal-unlock" : ""}`}
      style={{ width: size, height: size * 1.15 }}
    >
      <svg viewBox="0 0 64 74" width={size} height={size * 1.15} className="absolute inset-0">
        <path d="M 24 34 L 16 68 L 24 62 L 28 68 Z" className={unlocked ? "fill-brand-500" : "fill-slate-300"} />
        <path d="M 40 34 L 48 68 L 40 62 L 36 68 Z" className={unlocked ? "fill-calm-500" : "fill-slate-300"} />
        <circle cx="32" cy="28" r="24" fill={unlocked ? style.ring : "#cbd5e1"} />
        <circle cx="32" cy="28" r="19" fill={unlocked ? style.disc : "#e2e8f0"} />
        <circle
          cx="32"
          cy="28"
          r="23.25"
          fill="none"
          stroke={unlocked ? style.dark : "#94a3b8"}
          strokeWidth="1.5"
          opacity={0.5}
        />
      </svg>
      <Icon
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          top: size * 0.28,
          color: unlocked ? style.dark : "#94a3b8",
        }}
      />
      {!unlocked && (
        <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-white shadow-soft">
          <Lock className="h-2.5 w-2.5" />
        </span>
      )}
    </div>
  );
}
