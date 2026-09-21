"use client";

import { EMOTIONS, MAX_EMOTIONS_PER_ENTRY } from "@/lib/emotions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function EmotionPicker({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const { t } = useLanguage();
  const atLimit = selected.length >= MAX_EMOTIONS_PER_ENTRY;

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {EMOTIONS.map((emotion) => {
        const active = selected.includes(emotion.id);
        return (
          <button
            key={emotion.id}
            type="button"
            onClick={() => onToggle(emotion.id)}
            disabled={!active && atLimit}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
              active ? "emotion-pop border-brand-400 bg-brand-50" : "border-transparent bg-sand-50 hover:border-slate-200"
            }`}
          >
            <span className="text-2xl">{emotion.emoji}</span>
            <span className="text-center text-[11px] font-medium leading-tight text-slate-600">
              {t(emotion.labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
