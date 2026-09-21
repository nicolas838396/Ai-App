"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { applyColorTheme, DEFAULT_COLOR_THEME, type ColorThemeId } from "./colorThemes";
import { getColorThemePreference, setColorThemePreference } from "./preferences";

interface ColorThemeContextValue {
  colorTheme: ColorThemeId;
  setColorTheme: (theme: ColorThemeId) => void;
}

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null);

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorThemeId>(DEFAULT_COLOR_THEME);

  useEffect(() => {
    const stored = getColorThemePreference();
    setColorThemeState(stored);
    applyColorTheme(stored);
  }, []);

  function setColorTheme(theme: ColorThemeId) {
    setColorThemePreference(theme);
    setColorThemeState(theme);
    applyColorTheme(theme);
  }

  return <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>{children}</ColorThemeContext.Provider>;
}

export function useColorTheme(): ColorThemeContextValue {
  const ctx = useContext(ColorThemeContext);
  if (!ctx) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return ctx;
}
