"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Settings as SettingsIcon, Languages, Volume2, Sparkles, CircleCheck } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { Chip, toggleValue } from "@/components/Chip";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import {
  GOAL_OPTIONS,
  CONCERN_OPTIONS,
  STRESS_AREA_OPTIONS,
  USAGE_FREQUENCY_OPTIONS,
  type UserProfile,
} from "@/lib/onboardingOptions";
import { looksLikeMaleFirstName } from "@/lib/germanMaleFirstNames";
import {
  getLanguagePreference,
  setLanguagePreference,
  getVoiceGenderPreference,
  setVoiceGenderPreference,
  type Language,
  type VoiceGender,
} from "@/lib/preferences";

export default function SettingsPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [stressAreas, setStressAreas] = useState<string[]>([]);
  const [usageFrequency, setUsageFrequency] = useState("");
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState<boolean | null>(null);
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState("");
  const [cycleLengthDays, setCycleLengthDays] = useState("28");
  const [showCycleQuestionAnyway, setShowCycleQuestionAnyway] = useState(false);

  const [language, setLanguage] = useState<Language>("de");
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");

  useEffect(() => {
    setLanguage(getLanguagePreference());
    setVoiceGender(getVoiceGenderPreference() ?? "female");
  }, []);

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
        setCycleTrackingEnabled(profile.cycleTrackingEnabled);
        if (profile.lastPeriodStartDate) setLastPeriodStartDate(profile.lastPeriodStartDate.slice(0, 10));
        if (profile.cycleLengthDays) setCycleLengthDays(String(profile.cycleLengthDays));
      })
      .catch(() => setError("Dein Profil konnte nicht geladen werden."))
      .finally(() => setLoadingProfile(false));
  }, [session]);

  const showCycleQuestion = !looksLikeMaleFirstName(firstName) || showCycleQuestionAnyway;

  function handleLanguageChange(next: Language) {
    setLanguage(next);
    setLanguagePreference(next);
  }

  function handleVoiceGenderChange(next: VoiceGender) {
    setVoiceGender(next);
    setVoiceGenderPreference(next);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!firstName.trim() || !birthDate || goals.length === 0 || concerns.length === 0 || !usageFrequency) {
      setError("Bitte fülle Vorname, Geburtsdatum, mindestens ein Ziel, mindestens eine Angabe zu Beschwerden und die Nutzungshäufigkeit aus.");
      return;
    }
    if (showCycleQuestion && cycleTrackingEnabled === true && (!lastPeriodStartDate || !cycleLengthDays)) {
      setError("Bitte gib das Datum deiner letzten Periode und die Zykluslänge an, oder wähle „Nein“.");
      return;
    }
    setSaving(true);
    setError(null);
    setSavedAt(null);
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
          healthDataConsent: true,
        }),
      });
      setSavedAt(new Date().toLocaleTimeString());
    } catch {
      setError("Deine Änderungen konnten nicht gespeichert werden. Bitte versuch es erneut.");
    } finally {
      setSaving(false);
    }
  }

  if (sessionLoading || !session || loadingProfile) return <FullscreenLoader />;

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <SettingsIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h1 className="text-2xl">Einstellungen</h1>
            <p className="mt-0.5 text-sm text-slate-500">Dein Profil und deine Präferenzen.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-bold text-slate-800">Deine Angaben</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Vorname</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Geburtsdatum</label>
                <input
                  type="date"
                  value={birthDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-bold text-slate-800">Deine Ziele</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((option) => (
                <Chip key={option.value} active={goals.includes(option.value)} onClick={() => setGoals(toggleValue(goals, option.value))}>
                  {option.label}
                </Chip>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-bold text-slate-800">Aktuelle Beschwerden & Belastung</h2>
            <div className="mt-4 flex flex-wrap gap-2">
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
            <p className="mb-1.5 mt-5 text-sm font-semibold text-slate-700">
              Belastender Lebensbereich <span className="font-normal text-slate-400">(optional)</span>
            </p>
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
            <p className="mb-1.5 mt-5 text-sm font-semibold text-slate-700">Nutzungshäufigkeit</p>
            <div className="flex flex-wrap gap-2">
              {USAGE_FREQUENCY_OPTIONS.map((option) => (
                <Chip key={option.value} active={usageFrequency === option.value} onClick={() => setUsageFrequency(option.value)}>
                  {option.label}
                </Chip>
              ))}
            </div>

            {showCycleQuestion ? (
              <div className="mt-5">
                <p className="mb-1.5 text-sm font-semibold text-slate-700">
                  Menstruationszyklus berücksichtigen? <span className="font-normal text-slate-400">(optional)</span>
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
                className="mt-4 self-start text-xs font-semibold text-slate-400 underline decoration-dotted hover:text-slate-600"
              >
                Zyklus-Frage trifft trotzdem auf dich zu? Hier anzeigen
              </button>
            )}
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? "Speichert…" : "Änderungen speichern"}
            </button>
            {savedAt && (
              <span className="flex items-center gap-1 text-xs text-brand-700">
                <CircleCheck className="h-3.5 w-3.5" /> Gespeichert um {savedAt}
              </span>
            )}
          </div>
        </form>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-calm-50 text-calm-600">
              <Languages className="h-[18px] w-[18px]" />
            </span>
            <h2 className="font-bold text-slate-800">Sprache</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active={language === "de"} onClick={() => handleLanguageChange("de")}>
              Deutsch
            </Chip>
            <Chip active={language === "en"} onClick={() => {}}>
              English (bald verfügbar)
            </Chip>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Volume2 className="h-[18px] w-[18px]" />
            </span>
            <h2 className="font-bold text-slate-800">Stimme für die Sprachausgabe</h2>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">
            Welche Stimme soll Mira im Chat zum Vorlesen der Antworten verwenden?
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active={voiceGender === "female"} onClick={() => handleVoiceGenderChange("female")}>
              Weiblich
            </Chip>
            <Chip active={voiceGender === "male"} onClick={() => handleVoiceGenderChange("male")}>
              Männlich
            </Chip>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand-100 text-slate-500">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <h2 className="font-bold text-slate-800">Weitere Einstellungen</h2>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">
            Hier kommen mit der Zeit weitere Optionen dazu, z. B. Erinnerungen und Benachrichtigungen.
          </p>
        </section>
      </main>
    </>
  );
}
