// Selectable color themes. Unlike a single swappable hue, each theme is a
// coordinated PAIR of scales (primary + secondary) chosen to look good
// together — that's what backs the app's "brand" and "calm" Tailwind color
// tokens respectively. Both are stored as "R G B" strings so they can be
// written straight into CSS custom properties and consumed via Tailwind's
// `rgb(var(--brand-500) / <alpha-value>)` pattern — that's what lets every
// existing `bg-brand-*`/`text-calm-*`/etc. class across the app repaint
// instantly when the user switches themes, with no per-component changes.
export type ColorThemeId = "classic" | "light" | "dark" | "muted";

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
  /** Hex swatches for UI previews (match each scale's 500 step). */
  swatchPrimary: string;
  swatchSecondary: string;
  primary: ColorScale;
  secondary: ColorScale;
}

export const COLOR_THEMES: Record<ColorThemeId, ColorTheme> = {
  // The original look the app shipped with: green + lavender.
  classic: {
    id: "classic",
    nameKey: "theme.classic",
    swatchPrimary: "#339d7c",
    swatchSecondary: "#8264d1",
    primary: {
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
    secondary: {
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
  // Bright and airy: sky blue + coral.
  light: {
    id: "light",
    nameKey: "theme.light",
    swatchPrimary: "#2976ae",
    swatchSecondary: "#e26a36",
    primary: {
      50: "238 246 251",
      100: "218 234 246",
      200: "177 212 237",
      300: "123 182 224",
      400: "65 150 210",
      500: "41 118 174",
      600: "33 96 140",
      700: "26 76 112",
      800: "20 59 87",
      900: "16 48 70",
    },
    secondary: {
      50: "252 242 237",
      100: "249 225 215",
      200: "244 195 175",
      300: "237 159 126",
      400: "231 129 85",
      500: "226 106 54",
      600: "205 82 29",
      700: "165 66 24",
      800: "129 52 18",
      900: "103 41 15",
    },
  },
  // Deep and rich: navy + wine.
  dark: {
    id: "dark",
    nameKey: "theme.dark",
    swatchPrimary: "#2d3c76",
    swatchSecondary: "#7e2a3f",
    primary: {
      50: "225 229 244",
      100: "192 200 231",
      200: "137 151 210",
      300: "85 106 190",
      400: "59 78 155",
      500: "45 60 118",
      600: "36 48 96",
      700: "29 39 78",
      800: "24 32 63",
      900: "18 24 48",
    },
    secondary: {
      50: "245 224 230",
      100: "233 190 201",
      200: "214 133 153",
      300: "196 79 108",
      400: "161 54 80",
      500: "126 42 63",
      600: "103 34 52",
      700: "84 28 42",
      800: "69 23 34",
      900: "54 18 27",
    },
  },
  // Muted and plain: olive + taupe, low saturation throughout.
  muted: {
    id: "muted",
    nameKey: "theme.muted",
    swatchPrimary: "#718d62",
    swatchSecondary: "#9d7d5c",
    primary: {
      50: "244 247 243",
      100: "231 236 228",
      200: "206 217 201",
      300: "177 194 168",
      400: "141 167 129",
      500: "113 141 98",
      600: "91 114 79",
      700: "74 93 65",
      800: "60 75 52",
      900: "48 60 42",
    },
    secondary: {
      50: "247 245 242",
      100: "238 232 226",
      200: "219 207 194",
      300: "197 176 155",
      400: "176 148 120",
      500: "157 125 92",
      600: "129 102 75",
      700: "106 84 62",
      800: "87 69 51",
      900: "71 56 42",
    },
  },
};

export const DEFAULT_COLOR_THEME: ColorThemeId = "classic";

export function applyColorTheme(id: ColorThemeId) {
  const theme = COLOR_THEMES[id] ?? COLOR_THEMES[DEFAULT_COLOR_THEME];
  const root = document.documentElement.style;
  for (const [step, rgb] of Object.entries(theme.primary)) {
    root.setProperty(`--brand-${step}`, rgb);
  }
  for (const [step, rgb] of Object.entries(theme.secondary)) {
    root.setProperty(`--calm-${step}`, rgb);
  }
}
