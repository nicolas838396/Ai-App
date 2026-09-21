// Lightweight client-only preferences (voice + language). These don't need
// to sync across devices, so localStorage is enough — no backend field.
export type VoiceGender = "female" | "male";
export type Language = "de" | "en";

const VOICE_KEY = "mira:voice-gender";
const LANG_KEY = "mira:language";

export function getVoiceGenderPreference(): VoiceGender | null {
  try {
    const value = localStorage.getItem(VOICE_KEY);
    return value === "female" || value === "male" ? value : null;
  } catch {
    return null;
  }
}

export function setVoiceGenderPreference(gender: VoiceGender) {
  try {
    localStorage.setItem(VOICE_KEY, gender);
  } catch {
    // ignore (e.g. private browsing)
  }
}

export function getLanguagePreference(): Language {
  try {
    const value = localStorage.getItem(LANG_KEY);
    return value === "en" ? "en" : "de";
  } catch {
    return "de";
  }
}

export function setLanguagePreference(lang: Language) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // ignore
  }
}
