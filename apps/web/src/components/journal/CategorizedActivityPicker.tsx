"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { getActivityIcon } from "@/lib/activityIcons";
import { detectCurrentWeatherActivity } from "@/lib/weatherDetect";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

export interface Activity {
  id: string;
  name: string;
  category: string;
}

export interface ActivityLog {
  id: string;
  activityId: string;
  occurredAt: string;
}

const CATEGORY_ORDER = ["Bewegung", "Ernährung", "Schlaf", "Sozial", "Wetter", "Entspannung", "Alltag"];

const CATEGORY_LABEL_KEYS: Record<string, TranslationKey> = {
  Bewegung: "journal.category.movement",
  Ernährung: "journal.category.nutrition",
  Schlaf: "journal.category.sleep",
  Sozial: "journal.category.social",
  Wetter: "journal.category.weather",
  Entspannung: "journal.category.relaxation",
  Alltag: "journal.category.daily",
};

export function CategorizedActivityPicker({
  activities,
  todaysLogs,
  togglingId,
  onToggle,
  onLogByName,
}: {
  activities: Activity[];
  todaysLogs: ActivityLog[];
  togglingId: string | null;
  onToggle: (activity: Activity) => void;
  onLogByName: (name: string) => void;
}) {
  const { t } = useLanguage();
  const [openCategory, setOpenCategory] = useState<string | null>("Bewegung");
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const categories = Array.from(new Set(activities.map((a) => a.category)));
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => categories.includes(c)),
    ...categories.filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  async function handleDetectWeather() {
    setDetecting(true);
    setDetectError(null);
    try {
      const name = await detectCurrentWeatherActivity();
      onLogByName(name);
    } catch (err) {
      setDetectError(err instanceof Error ? err.message : t("journal.weatherDetectError"));
    } finally {
      setDetecting(false);
    }
  }

  return (
    <div className="divide-y divide-slate-100">
      {orderedCategories.map((category) => {
        const items = activities.filter((a) => a.category === category);
        const isOpen = openCategory === category;
        const loggedCount = items.filter((a) => todaysLogs.some((l) => l.activityId === a.id)).length;
        const labelKey = CATEGORY_LABEL_KEYS[category];

        return (
          <div key={category} className="py-3 first:pt-0">
            <button
              type="button"
              onClick={() => setOpenCategory(isOpen ? null : category)}
              className="flex w-full items-center gap-2.5 text-left"
            >
              <span className="flex-1 text-sm font-semibold text-slate-700">{labelKey ? t(labelKey) : category}</span>
              <span className="text-xs font-medium text-slate-400">{loggedCount > 0 ? `${loggedCount} ✓` : ""}</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="mt-3">
                {category === "Wetter" && (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={handleDetectWeather}
                      disabled={detecting}
                      className="flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-sand-200 disabled:opacity-50"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {detecting ? t("journal.weatherDetecting") : t("journal.weatherDetectButton")}
                    </button>
                    {detectError && <p className="mt-1.5 text-xs text-red-500">{detectError}</p>}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {items.map((activity) => {
                    const checked = todaysLogs.some((log) => log.activityId === activity.id);
                    const Icon = getActivityIcon(activity.name, activity.category);
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        disabled={togglingId === activity.id}
                        onClick={() => onToggle(activity)}
                        className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 text-center transition disabled:opacity-50 ${
                          checked ? "activity-pop border-brand-400 bg-brand-50" : "border-transparent bg-sand-50 hover:border-slate-200"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${checked ? "text-brand-600" : "text-slate-500"}`} />
                        <span className={`text-[11px] font-medium leading-tight ${checked ? "text-brand-700" : "text-slate-600"}`}>
                          {activity.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
