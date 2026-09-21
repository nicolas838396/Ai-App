"use client";

import { useState } from "react";
import { Share2, X, ChevronRight } from "lucide-react";
import { CATEGORY_ICONS, type Achievement } from "@/lib/achievements";
import { Medal } from "./Medal";
import { LaurelWreath } from "./LaurelWreath";
import { Confetti } from "./Confetti";
import { buildShareCardSvgMarkup, svgMarkupToPngBlob, shareOrDownloadImage, SHARE_CARD_SIZE } from "@/lib/shareImage";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const QUOTE_KEYS: TranslationKey[] = [
  "achievements.quote1",
  "achievements.quote2",
  "achievements.quote3",
  "achievements.quote4",
  "achievements.quote5",
];

export function AchievementCelebrationModal({
  achievements,
  statLine,
  onDone,
}: {
  achievements: Achievement[];
  statLine: string | null;
  onDone: () => void;
}) {
  const { t, language } = useLanguage();
  const [index, setIndex] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const achievement = achievements[index];
  if (!achievement) return null;

  const Icon = CATEGORY_ICONS[achievement.category];
  const isLast = index === achievements.length - 1;
  const quote = t(QUOTE_KEYS[achievement.id.length % QUOTE_KEYS.length]);

  function advance() {
    setShareMessage(null);
    if (isLast) onDone();
    else setIndex((i) => i + 1);
  }

  async function handleShare() {
    setSharing(true);
    setShareMessage(null);
    try {
      const svg = buildShareCardSvgMarkup({
        icon: Icon,
        tierIndex: achievement.tierIndex,
        tierCount: achievement.tierCount,
        title: achievement.title[language],
        description: achievement.description[language],
        statLine,
        quote,
      });
      const blob = await svgMarkupToPngBlob(svg, SHARE_CARD_SIZE.width, SHARE_CARD_SIZE.height);
      const result = await shareOrDownloadImage(blob, "mira-erfolg.png", `${achievement.title[language]} – Mira`);
      if (result === "downloaded") setShareMessage(t("achievements.shareDownloaded"));
      if (result === "failed") setShareMessage(t("achievements.shareFailed"));
    } catch {
      setShareMessage(t("achievements.shareFailed"));
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-900/95 px-6 text-center">
      <Confetti />

      <button
        type="button"
        onClick={onDone}
        aria-label={t("achievements.dismiss")}
        className="absolute right-5 top-5 text-white/50 hover:text-white/80"
      >
        <X className="h-6 w-6" />
      </button>

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">{t("achievements.unlockedToast")}</p>

      <div className="relative mt-4 flex h-48 w-48 items-center justify-center">
        <span className="celebration-glow absolute inset-0 rounded-full bg-brand-500/40 blur-xl" />
        <div className="celebration-wreath-in absolute inset-0">
          <LaurelWreath size={192} color="#e8c962" />
        </div>
        <div className="celebration-medal-in">
          <Medal icon={Icon} tierIndex={achievement.tierIndex} tierCount={achievement.tierCount} unlocked size={92} />
        </div>
      </div>

      <h2 className="mt-5 max-w-xs text-xl font-extrabold text-white">{achievement.title[language]}</h2>
      <p className="mt-1.5 max-w-xs text-sm text-slate-300">{achievement.description[language]}</p>

      {statLine && (
        <p className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">{statLine}</p>
      )}

      <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-600 disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" />
          {sharing ? t("achievements.sharePreparing") : t("achievements.shareButton")}
        </button>
        {shareMessage && <p className="text-xs text-slate-300">{shareMessage}</p>}
        <button
          type="button"
          onClick={advance}
          className="flex items-center justify-center gap-1 rounded-full px-6 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
        >
          {isLast ? t("achievements.celebrationDone") : t("achievements.celebrationNext")}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
