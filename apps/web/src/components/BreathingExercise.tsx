"use client";

import { useEffect, useRef, useState } from "react";

const PHASES = [
  { label: "Einatmen", scale: 1.4 },
  { label: "Halten", scale: 1.4 },
  { label: "Ausatmen", scale: 1 },
  { label: "Halten", scale: 1 },
] as const;

const PHASE_SECONDS = 4;

export function BreathingExercise() {
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
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex h-40 w-40 items-center justify-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-500/80 text-center text-sm font-medium text-white transition-transform duration-[4000ms] ease-in-out"
          style={{ transform: `scale(${running ? phase.scale : 1})` }}
        >
          {running ? phase.label : "Bereit"}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        className="rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        {running ? "Beenden" : "Übung starten"}
      </button>
      <p className="max-w-xs text-center text-xs text-slate-500">
        Box-Breathing: 4 Sekunden einatmen, 4 Sekunden halten, 4 Sekunden ausatmen, 4 Sekunden halten.
      </p>
    </div>
  );
}
