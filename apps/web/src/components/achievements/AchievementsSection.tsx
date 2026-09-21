"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  ACHIEVEMENTS,
  CATEGORY_ICONS,
  type AchievementCategory,
  type StatsSnapshot,
} from "@/lib/achievements";
import { Medal } from "./Medal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const CATEGORY_ORDER: AchievementCategory[] = [
  "streak",
  "greatMoodStreak",
  "greatMoodTotal",
  "moodTotal",
  "weeklyImprovement",
  "consistency",
  "journalTotal",
  "journalDepth",
  "journalStreak",
  "activityTotal",
  "activityVariety",
  "activityStreak",
  "insight",
  "reflection",
  "earlyBird",
  "nightOwl",
  "weekend",
  "comeback",
  "milestone",
];

const CATEGORY_LABEL_KEYS: Record<AchievementCategory, TranslationKey> = {
  streak: "achievements.category.streak",
  moodTotal: "achievements.category.moodTotal",
  greatMoodStreak: "achievements.category.greatMoodStreak",
  greatMoodTotal: "achievements.category.greatMoodTotal",
  weeklyImprovement: "achievements.category.weeklyImprovement",
  journalTotal: "achievements.category.journalTotal",
  journalDepth: "achievements.category.journalDepth",
  journalStreak: "achievements.category.journalStreak",
  activityTotal: "achievements.category.activityTotal",
  activityVariety: "achievements.category.activityVariety",
  activityStreak: "achievements.category.activityStreak",
  consistency: "achievements.category.consistency",
  insight: "achievements.category.insight",
  earlyBird: "achievements.category.earlyBird",
  nightOwl: "achievements.category.nightOwl",
  weekend: "achievements.category.weekend",
  reflection: "achievements.category.reflection",
  comeback: "achievements.category.comeback",
  milestone: "achievements.category.milestone",
};

export function AchievementsSection({ stats }: { stats: StatsSnapshot }) {
  const { t, language } = useLanguage();
  const [openCategory, setOpenCategory] = useState<AchievementCategory | null>("streak");

  const evaluated = useMemo(
    () => ACHIEVEMENTS.map((a) => ({ ...a, isUnlocked: a.unlocked(stats) })),
    [stats],
  );
  const totalUnlocked = evaluated.filter((a) => a.isUnlocked).length;

  const byCategory = useMemo(() => {
    const map = new Map<AchievementCategory, typeof evaluated>();
    for (const a of evaluated) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.tierIndex - b.tierIndex);
    return map;
  }, [evaluated]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">{t("achievements.title")}</h3>
        <span className="text-sm font-semibold text-slate-500">
          {t("achievements.progress", { unlocked: totalUnlocked, total: ACHIEVEMENTS.length })}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${(totalUnlocked / ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {CATEGORY_ORDER.map((category) => {
          const items = byCategory.get(category) ?? [];
          const unlockedCount = items.filter((a) => a.isUnlocked).length;
          const isOpen = openCategory === category;
          const Icon = CATEGORY_ICONS[category];
          return (
            <div key={category} className="py-3">
              <button
                type="button"
                onClick={() => setOpenCategory(isOpen ? null : category)}
                className="flex w-full items-center gap-2.5 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-100 text-slate-500">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-semibold text-slate-700">{t(CATEGORY_LABEL_KEYS[category])}</span>
                <span className="text-xs font-medium text-slate-400">
                  {unlockedCount}/{items.length}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {items.map((a) => (
                    <div key={a.id} className="flex flex-col items-center gap-1.5 rounded-xl bg-sand-50 p-3 text-center">
                      <Medal icon={Icon} tierIndex={a.tierIndex} tierCount={a.tierCount} unlocked={a.isUnlocked} size={44} />
                      <p className={`text-xs font-semibold ${a.isUnlocked ? "text-slate-700" : "text-slate-400"}`}>
                        {a.title[language]}
                      </p>
                      <p className="text-[11px] leading-snug text-slate-400">{a.description[language]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
