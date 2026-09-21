"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CATEGORY_ICONS, type Achievement } from "@/lib/achievements";
import { Medal } from "./Medal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const AUTO_ADVANCE_MS = 4000;

export function AchievementUnlockToast({ achievements, onDone }: { achievements: Achievement[]; onDone: () => void }) {
  const { t, language } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= achievements.length) {
      onDone();
      return;
    }
    const timer = setTimeout(() => setIndex((i) => i + 1), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, achievements.length]);

  if (index >= achievements.length) return null;
  const achievement = achievements[index];
  const Icon = CATEGORY_ICONS[achievement.category];

  return (
    <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <div className="flex max-w-sm items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-glow ring-1 ring-black/5">
        <Medal
          icon={Icon}
          tierIndex={achievement.tierIndex}
          tierCount={achievement.tierCount}
          unlocked
          justUnlocked
          size={48}
        />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600">
            {t("achievements.unlockedToast")}
          </p>
          <p className="text-sm font-bold text-slate-800">{achievement.title[language]}</p>
          <p className="text-xs text-slate-500">{achievement.description[language]}</p>
        </div>
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          className="ml-1 shrink-0 text-slate-300 hover:text-slate-500"
          aria-label={t("achievements.dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
