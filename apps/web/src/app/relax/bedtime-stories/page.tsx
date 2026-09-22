"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, RefreshCw, Volume2, Square, Moon } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getVoiceGenderPreference } from "@/lib/preferences";
import { isTtsSupported, speakLong, stopSpeaking, type LongSpeechHandle } from "@/lib/textToSpeech";

const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30];

interface Story {
  title: string;
  content: string;
}

export default function BedtimeStoriesPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t, language } = useLanguage();

  const [ideas, setIdeas] = useState<string[] | null>(null);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [ideasError, setIdeasError] = useState<string | null>(null);

  const [lengthMinutes, setLengthMinutes] = useState(15);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);

  const [speaking, setSpeaking] = useState(false);
  const speechRef = useRef<LongSpeechHandle | null>(null);

  function loadIdeas() {
    setIdeasLoading(true);
    setIdeasError(null);
    apiFetch<{ titles: string[] }>("/relax/bedtime-story-ideas", {
      method: "POST",
      body: JSON.stringify({ language }),
    })
      .then((res) => setIdeas(res.titles))
      .catch(() => setIdeasError(t("relax.bedtime.ideasError")))
      .finally(() => setIdeasLoading(false));
  }

  useEffect(() => {
    if (!session) return;
    loadIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    return () => {
      speechRef.current?.stop();
      stopSpeaking();
    };
  }, []);

  async function pickStory(title: string) {
    setGenerating(true);
    setGenerateError(null);
    try {
      const result = await apiFetch<Story>("/relax/bedtime-story", {
        method: "POST",
        body: JSON.stringify({ title, lengthMinutes, language }),
      });
      setStory(result);
    } catch {
      setGenerateError(t("relax.bedtime.generateError"));
    } finally {
      setGenerating(false);
    }
  }

  function toggleReadAloud() {
    if (speaking) {
      speechRef.current?.stop();
      speechRef.current = null;
      setSpeaking(false);
      return;
    }
    if (!story) return;
    const gender = getVoiceGenderPreference() ?? "female";
    setSpeaking(true);
    speechRef.current = speakLong(story.content, gender, undefined, () => setSpeaking(false));
  }

  function startOver() {
    speechRef.current?.stop();
    speechRef.current = null;
    setSpeaking(false);
    setStory(null);
    setGenerateError(null);
  }

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  // Warm, low-blue-light palette throughout — amber/rose against near-black,
  // deliberately avoiding blue/cyan tones so the screen itself doesn't fight
  // against the "getting sleepy" goal.
  return (
    <>
      <AppNav />
      <main className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-950 via-[#241a13] to-slate-950 px-6 py-8 text-amber-50">
        <div className="mx-auto max-w-lg space-y-6">
          <Link href="/relax" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-200/70 hover:text-amber-100">
            <ArrowLeft className="h-4 w-4" />
            {t("relax.backToThemes")}
          </Link>

          {!story ? (
            <>
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <span className="celebration-glow absolute inset-0 rounded-full bg-amber-500/30 blur-lg" />
                  <Moon className="gentle-float relative h-10 w-10 text-amber-300" />
                </div>
                <h1 className="text-xl font-bold">{t("relax.bedtime.pageTitle")}</h1>
                <p className="max-w-xs text-sm text-amber-200/70">{t("relax.bedtime.intro")}</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <p className="mb-3 text-sm font-semibold text-amber-100">{t("relax.bedtime.durationLabel")}</p>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setLengthMinutes(minutes)}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                        lengthMinutes === minutes
                          ? "bg-amber-400 text-slate-900 shadow-glow"
                          : "bg-white/10 text-amber-200/80 hover:bg-white/20"
                      }`}
                    >
                      {t("relax.bedtime.minutes", { minutes })}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-100">{t("relax.bedtime.pickIdea")}</p>
                  {!ideasLoading && (
                    <button
                      type="button"
                      onClick={loadIdeas}
                      className="flex items-center gap-1 text-xs font-semibold text-amber-200/70 hover:text-amber-100"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {t("relax.bedtime.refreshIdeas")}
                    </button>
                  )}
                </div>

                {ideasLoading && <p className="text-sm text-amber-200/60">{t("relax.bedtime.loadingIdeas")}</p>}
                {ideasError && <p className="text-sm text-rose-300">{ideasError}</p>}

                {!ideasLoading && ideas && (
                  <div className="space-y-2">
                    {ideas.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => pickStory(idea)}
                        disabled={generating}
                        className="tap-pop flex w-full items-center gap-2.5 rounded-full bg-white/10 px-4 py-3 text-left text-sm font-medium text-amber-50 transition hover:bg-white/20 disabled:opacity-50"
                      >
                        <BookOpen className="h-4 w-4 shrink-0 text-amber-300" />
                        {idea}
                      </button>
                    ))}
                  </div>
                )}

                {generating && (
                  <p className="mt-3 text-sm text-amber-200/70">{t("relax.bedtime.generating")}</p>
                )}
                {generateError && <p className="mt-3 text-sm text-rose-300">{generateError}</p>}
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <h1 className="text-xl font-bold">{story.title}</h1>
              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <p className="whitespace-pre-line text-sm leading-relaxed text-amber-50/90">{story.content}</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {isTtsSupported() && (
                  <button
                    type="button"
                    onClick={toggleReadAloud}
                    className="flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-glow transition hover:bg-amber-300"
                  >
                    {speaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    {speaking ? t("relax.bedtime.stopReading") : t("relax.bedtime.readAloud")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={startOver}
                  className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-white/20"
                >
                  {t("relax.bedtime.newStory")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
