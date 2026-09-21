"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { apiFetch } from "@/lib/apiClient";
import {
  GOAL_OPTIONS,
  CONCERN_OPTIONS,
  STRESS_AREA_OPTIONS,
  USAGE_FREQUENCY_OPTIONS,
  type UserProfile,
} from "@/lib/onboardingOptions";
import { looksLikeMaleFirstName } from "@/lib/germanMaleFirstNames";

const TOTAL_STEPS = 2;

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-brand-400 bg-brand-500 text-white shadow-soft"
          : "border-slate-200 text-slate-600 hover:border-brand-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession({
    requireAuth: true,
    skipOnboardingCheck: true,
  });

  const [step, setStep] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [stressAreas, setStressAreas] = useState<string[]>([]);
  const [usageFrequency, setUsageFrequency] = useState("");
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState<boolean | null>(null);
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState("");
  const [cycleLengthDays, setCycleLengthDays] = useState("28");
  const [consent, setConsent] = useState(false);
  const [showCycleQuestionAnyway, setShowCycleQuestionAnyway] = useState(false);

  useEffect(() => {
    if (!session) return;
    apiFetch<UserProfile>("/users/me")
      .then((profile) => {
        if (profile.firstName) setFirstName(profile.firstName);
        if (profile.birthDate) setBirthDate(profile.birthDate.slice(0, 10));
        if (profile.goals?.length) setGoals(profile.goals);
        if (profile.concerns?.length) setConcerns(profile.concerns);
        if (profile.stressAreas?.length) setStressAreas(profile.stressAreas);
        if (profile.usageFrequency) setUsageFrequency(profile.usageFrequency);
        if (profile.onboardingCompletedAt) setCycleTrackingEnabled(profile.cycleTrackingEnabled);
        if (profile.lastPeriodStartDate) setLastPeriodStartDate(profile.lastPeriodStartDate.slice(0, 10));
        if (profile.cycleLengthDays) setCycleLengthDays(String(profile.cycleLengthDays));
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [session]);

  const step1Valid = goals.length > 0;
  const showCycleQuestion = !looksLikeMaleFirstName(firstName) || showCycleQuestionAnyway;
  const cycleValid =
    !showCycleQuestion ||
    cycleTrackingEnabled === false ||
    (cycleTrackingEnabled === true && lastPeriodStartDate.length > 0 && cycleLengthDays.length > 0);
  const step2Valid =
    concerns.length > 0 &&
    usageFrequency.length > 0 &&
    (!showCycleQuestion || cycleTrackingEnabled !== null) &&
    cycleValid &&
    consent;

  function goNext() {
    setError(null);
    if (step === 1 && !step1Valid) {
      setError("Bitte wähle mindestens ein Ziel aus.");
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!step2Valid) {
      setError(
        "Bitte wähle mindestens eine Angabe zu deinen Beschwerden, deine Nutzungshäufigkeit, beantworte die Zyklus-Frage (auch mit „Nein“ möglich) und bestätige die Einwilligung.",
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/users/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: firstName.trim(),
          birthDate,
          goals,
          concerns,
          stressAreas,
          usageFrequency,
          cycleTrackingEnabled: showCycleQuestion && cycleTrackingEnabled === true,
          ...(showCycleQuestion && cycleTrackingEnabled
            ? { lastPeriodStartDate, cycleLengthDays: Number(cycleLengthDays) }
            : {}),
          healthDataConsent: consent,
        }),
      });
      router.push("/dashboard");
    } catch {
      setError("Deine Angaben konnten nicht gespeichert werden. Bitte versuch es erneut.");
      setSubmitting(false);
    }
  }

  if (sessionLoading || !session || loadingProfile) return <FullscreenLoader />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-6 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white/90 p-8 shadow-soft ring-1 ring-black/5 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="text-2xl">Schön, dass du da bist</h1>
          <p className="text-sm text-slate-500">
            Ein paar kurze Fragen, damit Mira dich besser begleiten kann.
          </p>
        </div>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-sand-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs font-medium text-slate-400">
          Schritt {step} von {TOTAL_STEPS}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {step === 1 && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Was möchtest du mit Mira erreichen? <span className="font-normal text-slate-400">(Mehrfachauswahl)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((option) => (
                  <Chip key={option.value} active={goals.includes(option.value)} onClick={() => setGoals(toggleValue(goals, option.value))}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Beschäftigt dich aktuell etwas davon? <span className="font-normal text-slate-400">(Mehrfachauswahl)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONCERN_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      active={concerns.includes(option.value)}
                      onClick={() => setConcerns(toggleValue(concerns, option.value))}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Wo entsteht gerade am meisten Belastung?{" "}
                  <span className="font-normal text-slate-400">(optional, Mehrfachauswahl)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {STRESS_AREA_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      active={stressAreas.includes(option.value)}
                      onClick={() => setStressAreas(toggleValue(stressAreas, option.value))}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Wie oft möchtest du Mira nutzen?
                </label>
                <div className="flex flex-wrap gap-2">
                  {USAGE_FREQUENCY_OPTIONS.map((option) => (
                    <Chip key={option.value} active={usageFrequency === option.value} onClick={() => setUsageFrequency(option.value)}>
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {showCycleQuestion ? (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Hast du einen Menstruationszyklus, den Mira berücksichtigen soll?{" "}
                    <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <p className="mb-2 text-xs text-slate-400">
                    Manche Beschwerden hängen mit dem Zyklus zusammen – wenn du magst, behält Mira das
                    im Hinterkopf, ohne es dir vorzuschreiben.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={cycleTrackingEnabled === true} onClick={() => setCycleTrackingEnabled(true)}>
                      Ja
                    </Chip>
                    <Chip active={cycleTrackingEnabled === false} onClick={() => setCycleTrackingEnabled(false)}>
                      Nein
                    </Chip>
                  </div>

                  {cycleTrackingEnabled === true && (
                    <div className="mt-3 flex flex-col gap-3 rounded-xl bg-sand-50 p-3.5">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Erster Tag deiner letzten Periode
                        </label>
                        <input
                          type="date"
                          value={lastPeriodStartDate}
                          max={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setLastPeriodStartDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Durchschnittliche Zykluslänge (Tage)
                        </label>
                        <input
                          type="number"
                          min={15}
                          max={45}
                          value={cycleLengthDays}
                          onChange={(e) => setCycleLengthDays(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCycleQuestionAnyway(true)}
                  className="self-start text-xs font-semibold text-slate-400 underline decoration-dotted hover:text-slate-600"
                >
                  Zyklus-Frage trifft trotzdem auf dich zu? Hier anzeigen
                </button>
              )}

              <label className="flex items-start gap-2.5 rounded-xl bg-sand-50 p-3.5 text-xs leading-relaxed text-slate-600">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-brand-500"
                />
                Ich bin damit einverstanden, dass meine Angaben zu Beschwerden, Zielen und –
                falls angegeben – meinem Zyklus als gesundheitsbezogene Daten verarbeitet werden,
                um Mira für mich persönlicher zu machen. Ich kann diese Einwilligung jederzeit
                widerrufen.
              </label>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </button>
            ) : (
              <span />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
              >
                Weiter
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-50"
              >
                {submitting ? "…" : "Fertig"}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
