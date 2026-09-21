"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const PHASES: { labelKey: TranslationKey; scale: number }[] = [
  { labelKey: "breathing.inhale", scale: 1.4 },
  { labelKey: "breathing.hold", scale: 1.4 },
  { labelKey: "breathing.exhale", scale: 1 },
  { labelKey: "breathing.hold", scale: 1 },
];

const PHASE_SECONDS = 4;

export function BreathingExercise() {
  const { t } = useLanguage();
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhaseIndex(0);
      return;
    }
    intervalRef.current = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, PHASE_SECONDS * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const phase = PHASES[phaseIndex];

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex h-44 w-44 items-center justify-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-calm-400 to-brand-400 text-center text-sm font-bold text-white shadow-glow transition-transform duration-[4000ms] ease-in-out"
          style={{ transform: `scale(${running ? phase.scale : 1})` }}
        >
          {running ? t(phase.labelKey) : t("breathing.ready")}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        className="flex items-center gap-2 rounded-full bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-700"
      >
        {running ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {running ? t("breathing.stop") : t("breathing.start")}
      </button>
      <p className="max-w-xs text-center text-xs text-slate-400">{t("breathing.description")}</p>
    </div>
  );
}
