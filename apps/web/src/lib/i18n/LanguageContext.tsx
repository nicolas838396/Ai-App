"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type TranslationKey } from "./translations";
import { getLanguagePreference, setLanguagePreference, type Language } from "@/lib/preferences";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return Object.entries(vars).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");

  useEffect(() => {
    setLanguageState(getLanguagePreference());
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(lang: Language) {
    setLanguagePreference(lang);
    setLanguageState(lang);
  }

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const template = translations[language][key] ?? translations.de[key] ?? key;
    return interpolate(template, vars);
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
