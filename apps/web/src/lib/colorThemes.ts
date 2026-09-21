// Selectable brand color palettes. Each is a full 50–900 scale (same shape
// as Tailwind's default scales) stored as "R G B" strings so they can be
// written straight into CSS custom properties and consumed via Tailwind's
// `rgb(var(--brand-500) / <alpha-value>)` pattern — that's what lets every
// existing `bg-brand-500`, `text-brand-600`, etc. across the app repaint
// instantly when the user switches palettes, with no per-component changes.
export type ColorThemeId = "green" | "ocean" | "sunset" | "lavender";

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ColorTheme {
  id: ColorThemeId;
  nameKey: `theme.${ColorThemeId}`;
  /** Hex swatch for UI previews (matches the 500 step). */
  swatch: string;
  scale: ColorScale;
}

export const COLOR_THEMES: Record<ColorThemeId, ColorTheme> = {
  green: {
    id: "green",
    nameKey: "theme.green",
    swatch: "#339d7c",
    scale: {
      50: "240 250 246",
      100: "219 243 232",
      200: "184 230 211",
      300: "138 211 184",
      400: "87 185 152",
      500: "51 157 124",
      600: "36 127 100",
      700: "30 101 81",
      800: "26 81 66",
      900: "22 66 55",
    },
  },
  ocean: {
    id: "ocean",
    nameKey: "theme.ocean",
    swatch: "#3b82f6",
    scale: {
      50: "239 246 255",
      100: "219 234 254",
      200: "191 219 254",
      300: "147 197 253",
      400: "96 165 250",
      500: "59 130 246",
      600: "37 99 235",
      700: "29 78 216",
      800: "30 64 175",
      900: "30 58 138",
    },
  },
  sunset: {
    id: "sunset",
    nameKey: "theme.sunset",
    swatch: "#f97316",
    scale: {
      50: "255 247 237",
      100: "255 237 213",
      200: "254 215 170",
      300: "253 186 116",
      400: "251 146 60",
      500: "249 115 22",
      600: "234 88 12",
      700: "194 65 12",
      800: "154 52 18",
      900: "124 45 18",
    },
  },
  lavender: {
    id: "lavender",
    nameKey: "theme.lavender",
    swatch: "#8264d1",
    scale: {
      50: "244 242 253",
      100: "232 227 250",
      200: "211 201 245",
      300: "182 165 236",
      400: "154 128 224",
      500: "130 100 209",
      600: "108 76 184",
      700: "88 61 150",
      800: "73 51 120",
      900: "61 44 98",
    },
  },
};

export const DEFAULT_COLOR_THEME: ColorThemeId = "green";

export function applyColorTheme(id: ColorThemeId) {
  const theme = COLOR_THEMES[id] ?? COLOR_THEMES[DEFAULT_COLOR_THEME];
  const root = document.documentElement.style;
  for (const [step, rgb] of Object.entries(theme.scale)) {
    root.setProperty(`--brand-${step}`, rgb);
  }
}
