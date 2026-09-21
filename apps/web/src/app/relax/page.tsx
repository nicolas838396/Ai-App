"use client";

import { useEffect, useRef, useState } from "react";
import { CloudRain, Waves, Wind as WindIcon, AudioLines, Square } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { BreathingExercise } from "@/components/BreathingExercise";
import { useSession } from "@/lib/useSession";
import { playSound, type ActiveSound, type SoundId } from "@/lib/ambientSounds";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const SOUNDS: { id: SoundId; labelKey: TranslationKey; icon: typeof CloudRain }[] = [
  { id: "regen", labelKey: "relax.sound.regen", icon: CloudRain },
  { id: "wellen", labelKey: "relax.sound.wellen", icon: Waves },
  { id: "wind", labelKey: "relax.sound.wind", icon: WindIcon },
  { id: "rauschen", labelKey: "relax.sound.rauschen", icon: AudioLines },
];

export default function RelaxPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();
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

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <div>
          <h1 className="text-2xl">{t("relax.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("relax.subtitle")}</p>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <h2 className="font-bold text-slate-800">{t("relax.soundsTitle")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {SOUNDS.map((sound) => {
              const active = activeSoundId === sound.id;
              return (
                <button
                  key={sound.id}
                  type="button"
                  onClick={() => toggleSound(sound.id)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
                    active
                      ? "border-calm-300 bg-calm-50 text-calm-700 shadow-soft"
                      : "border-slate-200 text-slate-600 hover:border-calm-200"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active ? "bg-calm-500 text-white" : "bg-sand-100 text-slate-500"
                    }`}
                  >
                    {active ? <Square className="h-3.5 w-3.5" /> : <sound.icon className="h-4 w-4" />}
                  </span>
                  {t(sound.labelKey)}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-sand-50 px-4 py-3">
            <span className="text-xs font-medium text-slate-400">{t("relax.quiet")}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-calm-100 accent-calm-500"
            />
            <span className="text-xs font-medium text-slate-400">{t("relax.loud")}</span>
          </div>
          <p className="mt-3 text-xs text-slate-400">{t("relax.browserGenerated")}</p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <h2 className="font-bold text-slate-800">{t("relax.breathingTitle")}</h2>
          <BreathingExercise />
        </section>
      </main>
    </>
  );
}
