import type { Language } from "./preferences";
import { translations, type TranslationKey } from "./i18n/translations";

// Supabase Auth returns its error messages only in English. We map the
// common ones to a translation key so they show in the user's chosen
// language instead of raw English; anything unrecognized falls back to a
// generic message.
const KNOWN_ERRORS: { match: string; key: TranslationKey }[] = [
  { match: "invalid login credentials", key: "authError.invalidCredentials" },
  { match: "email not confirmed", key: "authError.emailNotConfirmed" },
  { match: "user already registered", key: "authError.alreadyRegistered" },
  { match: "email rate limit exceeded", key: "authError.rateLimit" },
  { match: "for security purposes", key: "authError.tooManyRequests" },
  { match: "password should be at least", key: "authError.passwordTooShort" },
  { match: "unable to validate email address", key: "authError.invalidEmail" },
  { match: "signup is disabled", key: "authError.signupDisabled" },
  { match: "network", key: "authError.network" },
];

export function translateAuthError(message: string | undefined | null, language: Language): string {
  const lower = (message ?? "").toLowerCase();
  const known = KNOWN_ERRORS.find((entry) => lower.includes(entry.match));
  const key = known?.key ?? "authError.generic";
  return translations[language][key] ?? translations.de[key];
}
