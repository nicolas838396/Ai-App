"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  CATEGORY_META,
  EMOJI_CHOICES,
  IMPORTANT_DATE_CATEGORIES,
  type ImportantDateCategory,
  type ImportantDateEntry,
} from "@/lib/importantDates";

export interface ImportantDateFormValues {
  title: string;
  category: ImportantDateCategory;
  emoji: string;
  date: string;
  recurringYearly: boolean;
}

export function ImportantDateForm({
  initialDate,
  editing,
  saving,
  onSave,
  onCancel,
}: {
  initialDate: string;
  editing: ImportantDateEntry | null;
  saving: boolean;
  onSave: (values: ImportantDateFormValues) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [category, setCategory] = useState<ImportantDateCategory>(editing?.category ?? "other");
  const [emoji, setEmoji] = useState(editing?.emoji ?? CATEGORY_META.other.defaultEmoji);
  const [date, setDate] = useState((editing?.date ?? initialDate).slice(0, 10));
  const [recurringYearly, setRecurringYearly] = useState(editing?.recurringYearly ?? true);

  function handleCategoryChange(next: ImportantDateCategory) {
    setCategory(next);
    // Only nudge the emoji to the category default if the user hasn't
    // deliberately picked something else already (i.e. it still matches the
    // previous category's default).
    if (emoji === CATEGORY_META[category].defaultEmoji) {
      setEmoji(CATEGORY_META[next].defaultEmoji);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave({ title: title.trim(), category, emoji, date, recurringYearly });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-sand-50 p-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">{t("calendar.titleLabel")}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("calendar.titlePlaceholder")}
          maxLength={100}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">{t("calendar.categoryLabel")}</label>
        <div className="flex flex-wrap gap-1.5">
          {IMPORTANT_DATE_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`tap-pop flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? "bg-brand-500 text-white shadow-soft" : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(meta.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">{t("calendar.emojiLabel")}</label>
        <div className="flex flex-wrap gap-1.5">
          {EMOJI_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setEmoji(choice)}
              aria-label={choice}
              className={`tap-pop flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                emoji === choice ? "bg-brand-500 shadow-soft" : "bg-white ring-1 ring-slate-200"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-500">{t("calendar.dateLabel")}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-400"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={recurringYearly}
          onChange={(e) => setRecurringYearly(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
        />
        {t("calendar.recurringLabel")}
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? t("calendar.saving") : t("calendar.save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-white"
        >
          {t("calendar.cancel")}
        </button>
      </div>
    </form>
  );
}
