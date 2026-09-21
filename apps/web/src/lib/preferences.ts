// Lightweight client-only preferences (voice + language + color theme).
// These don't need to sync across devices, so localStorage is enough — no
// backend field.
import { DEFAULT_COLOR_THEME, type ColorThemeId } from "./colorThemes";

export type VoiceGender = "female" | "male";
export type Language = "de" | "en";

const VOICE_KEY = "mira:voice-gender";
const LANG_KEY = "mira:language";
const COLOR_THEME_KEY = "mira:color-theme";

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

const VALID_THEME_IDS: ColorThemeId[] = ["classic", "light", "dark", "muted"];

export function getColorThemePreference(): ColorThemeId {
  try {
    const value = localStorage.getItem(COLOR_THEME_KEY);
    return (VALID_THEME_IDS as string[]).includes(value ?? "") ? (value as ColorThemeId) : DEFAULT_COLOR_THEME;
  } catch {
    return DEFAULT_COLOR_THEME;
  }
}

export function setColorThemePreference(theme: ColorThemeId) {
  try {
    localStorage.setItem(COLOR_THEME_KEY, theme);
  } catch {
    // ignore
  }
}
