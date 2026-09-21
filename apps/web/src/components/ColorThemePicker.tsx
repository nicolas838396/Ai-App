"use client";

import { Check } from "lucide-react";
import { COLOR_THEMES, type ColorThemeId } from "@/lib/colorThemes";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const THEME_IDS: ColorThemeId[] = ["classic", "light", "dark", "muted"];

export function ColorThemePicker({ value, onChange }: { value: ColorThemeId; onChange: (id: ColorThemeId) => void }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      {/* Live example — reflects the theme as soon as it's picked, since
          picking writes straight to the shared CSS variables. */}
      <div className="flex-1 rounded-2xl bg-sand-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t("theme.previewLabel")}</p>
        <div className="rounded-xl bg-white p-4 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
              M
            </span>
            <span className="text-sm font-bold text-slate-700">Mira</span>
            <span className="ml-auto rounded-full bg-calm-100 px-2 py-0.5 text-[10px] font-semibold text-calm-700">
              {t("theme.previewBadge")}
            </span>
          </div>
          <div className="mt-3 max-w-[85%] rounded-2xl rounded-bl-sm bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-800">
            {t("theme.previewBubble")}
          </div>
          <button
            type="button"
            tabIndex={-1}
            className="mt-3 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-soft"
          >
            {t("theme.previewButton")}
          </button>
        </div>
      </div>

      <div className="flex gap-3 md:w-36 md:flex-col">
        {THEME_IDS.map((id) => {
          const theme = COLOR_THEMES[id];
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition md:flex-row md:justify-start md:gap-2 md:px-3 ${
                active ? "border-slate-800" : "border-transparent hover:border-slate-200"
              }`}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.swatchPrimary} 50%, ${theme.swatchSecondary} 50%)`,
                }}
              >
                {active && <Check className="h-4 w-4 text-white drop-shadow" />}
              </span>
              <span className="text-xs font-semibold text-slate-600">{t(theme.nameKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
