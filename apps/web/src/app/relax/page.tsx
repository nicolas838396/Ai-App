"use client";

import { useEffect, useRef, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { BreathingExercise } from "@/components/BreathingExercise";
import { useSession } from "@/lib/useSession";
import { playSound, type ActiveSound, type SoundId } from "@/lib/ambientSounds";

const SOUNDS: { id: SoundId; label: string }[] = [
  { id: "regen", label: "Regen" },
  { id: "wellen", label: "Meereswellen" },
  { id: "wind", label: "Wind" },
  { id: "rauschen", label: "Weißes Rauschen" },
];

export default function RelaxPage() {
  const { loading: sessionLoading } = useSession({ requireAuth: true });
  const [activeSoundId, setActiveSoundId] = useState<SoundId | null>(null);
  const [volume, setVolume] = useState(0.4);
  const activeSoundRef = useRef<ActiveSound | null>(null);

  useEffect(() => {
    return () => activeSoundRef.current?.stop();
  }, []);

  function toggleSound(id: SoundId) {
    if (activeSoundId === id) {
      activeSoundRef.current?.stop();
      activeSoundRef.current = null;
      setActiveSoundId(null);
      return;
    }
    activeSoundRef.current?.stop();
    activeSoundRef.current = playSound(id, volume);
    setActiveSoundId(id);
  }

  function handleVolumeChange(value: number) {
    setVolume(value);
    activeSoundRef.current?.setVolume(value);
  }

  if (sessionLoading) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        <h1 className="text-xl font-semibold text-brand-700">Entspannung</h1>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-medium text-brand-700">Beruhigende Klänge</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {SOUNDS.map((sound) => (
              <button
                key={sound.id}
                type="button"
                onClick={() => toggleSound(sound.id)}
                className={`rounded-md border px-3 py-3 text-sm font-medium transition ${
                  activeSoundId === sound.id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-brand-300"
                }`}
              >
                {activeSoundId === sound.id ? "■ " : "▶ "}
                {sound.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-slate-400">Leise</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-slate-400">Laut</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Erzeugt direkt im Browser, keine Audiodateien nötig.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-medium text-brand-700">Atemübung</h2>
          <BreathingExercise />
        </section>
      </main>
    </>
  );
}
