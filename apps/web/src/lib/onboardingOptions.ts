import type { TranslationKey } from "./i18n/translations";

// Value strings must stay in sync with apps/api/src/modules/users/dto/complete-onboarding.dto.ts

export const GOAL_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: "stress_reduzieren", labelKey: "goal.stress_reduzieren" },
  { value: "stimmung_verbessern", labelKey: "goal.stimmung_verbessern" },
  { value: "gewohnheiten_aufbauen", labelKey: "goal.gewohnheiten_aufbauen" },
  { value: "selbstverstaendnis", labelKey: "goal.selbstverstaendnis" },
  { value: "schlaf_verbessern", labelKey: "goal.schlaf_verbessern" },
  { value: "beziehungen", labelKey: "goal.beziehungen" },
  { value: "sonstiges", labelKey: "goal.sonstiges" },
];

export const CONCERN_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: "angst", labelKey: "concern.angst" },
  { value: "niedergeschlagenheit", labelKey: "concern.niedergeschlagenheit" },
  { value: "stress_ueberforderung", labelKey: "concern.stress_ueberforderung" },
  { value: "schlafprobleme", labelKey: "concern.schlafprobleme" },
  { value: "konzentration", labelKey: "concern.konzentration" },
  { value: "einsamkeit", labelKey: "concern.einsamkeit" },
  { value: "selbstwert", labelKey: "concern.selbstwert" },
  { value: "keine", labelKey: "concern.keine" },
  { value: "sonstiges", labelKey: "concern.sonstiges" },
];

export const STRESS_AREA_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: "arbeit", labelKey: "stressArea.arbeit" },
  { value: "beziehung", labelKey: "stressArea.beziehung" },
  { value: "familie", labelKey: "stressArea.familie" },
  { value: "gesundheit", labelKey: "stressArea.gesundheit" },
  { value: "finanzen", labelKey: "stressArea.finanzen" },
  { value: "sonstiges", labelKey: "stressArea.sonstiges" },
];

export const USAGE_FREQUENCY_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: "taeglich", labelKey: "usageFrequency.taeglich" },
  { value: "mehrmals_woechentlich", labelKey: "usageFrequency.mehrmals_woechentlich" },
  { value: "bei_bedarf", labelKey: "usageFrequency.bei_bedarf" },
];

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  birthDate: string | null;
  goals: string[];
  concerns: string[];
  stressAreas: string[];
  usageFrequency: string | null;
  cycleTrackingEnabled: boolean;
  lastPeriodStartDate: string | null;
  cycleLengthDays: number | null;
  onboardingCompletedAt: string | null;
}
