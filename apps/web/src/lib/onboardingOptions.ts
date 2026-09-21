// Value strings must stay in sync with apps/api/src/modules/users/dto/complete-onboarding.dto.ts

export const GOAL_OPTIONS = [
  { value: "stress_reduzieren", label: "Stress reduzieren" },
  { value: "stimmung_verbessern", label: "Stimmung verbessern" },
  { value: "gewohnheiten_aufbauen", label: "Bessere Gewohnheiten aufbauen" },
  { value: "selbstverstaendnis", label: "Mich selbst besser verstehen" },
  { value: "schlaf_verbessern", label: "Besser schlafen" },
  { value: "beziehungen", label: "Beziehungen verbessern" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const CONCERN_OPTIONS = [
  { value: "angst", label: "Angst / Sorgen" },
  { value: "niedergeschlagenheit", label: "Niedergeschlagenheit" },
  { value: "stress_ueberforderung", label: "Stress / Überforderung" },
  { value: "schlafprobleme", label: "Schlafprobleme" },
  { value: "konzentration", label: "Konzentrationsprobleme" },
  { value: "einsamkeit", label: "Einsamkeit" },
  { value: "selbstwert", label: "Selbstwertprobleme" },
  { value: "keine", label: "Aktuell keine besonderen Beschwerden" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const STRESS_AREA_OPTIONS = [
  { value: "arbeit", label: "Arbeit / Ausbildung" },
  { value: "beziehung", label: "Beziehung / Partnerschaft" },
  { value: "familie", label: "Familie" },
  { value: "gesundheit", label: "Gesundheit" },
  { value: "finanzen", label: "Finanzen" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const USAGE_FREQUENCY_OPTIONS = [
  { value: "taeglich", label: "Täglich" },
  { value: "mehrmals_woechentlich", label: "Mehrmals pro Woche" },
  { value: "bei_bedarf", label: "Bei Bedarf" },
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
