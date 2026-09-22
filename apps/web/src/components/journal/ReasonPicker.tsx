"use client";

import { MOOD_REASONS, MAX_MOOD_REASONS_PER_ENTRY } from "@/lib/moodReasons";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ReasonPicker({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const { t } = useLanguage();
  const atLimit = selected.length >= MAX_MOOD_REASONS_PER_ENTRY;

  return (
    <div className="flex flex-wrap gap-2">
      {MOOD_REASONS.map((reason) => {
        const active = selected.includes(reason.id);
        return (
          <button
            key={reason.id}
            type="button"
            onClick={() => onToggle(reason.id)}
            disabled={!active && atLimit}
            className={`tap-pop flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              active ? "border-calm-400 bg-calm-50 text-calm-800" : "border-transparent bg-sand-50 text-slate-600 hover:border-slate-200"
            }`}
          >
            <span>{reason.emoji}</span>
            {t(reason.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
