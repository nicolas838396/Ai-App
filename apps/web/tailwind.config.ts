import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      colors: {
        // Backed by CSS custom properties (defined in globals.css, updated
        // at runtime by lib/colorThemes.ts) so a user's chosen color theme
        // repaints every existing `bg-brand-*`/`text-brand-*`/etc. class
        // across the app without touching individual components. The
        // `<alpha-value>` placeholder keeps opacity modifiers (e.g.
        // `bg-brand-500/30`) working as usual.
        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "rgb(var(--brand-200) / <alpha-value>)",
          300: "rgb(var(--brand-300) / <alpha-value>)",
          400: "rgb(var(--brand-400) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
          800: "rgb(var(--brand-800) / <alpha-value>)",
          900: "rgb(var(--brand-900) / <alpha-value>)",
        },
        calm: {
          50: "#f4f2fd",
          100: "#e8e3fa",
          200: "#d3c9f5",
          300: "#b6a5ec",
          400: "#9a80e0",
          500: "#8264d1",
          600: "#6c4cb8",
          700: "#583d96",
          800: "#493378",
          900: "#3d2c62",
        },
        sand: {
          50: "#fbfaf7",
          100: "#f5f2ea",
          200: "#ece5d4",
        },
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(22, 66, 55, 0.08), 0 8px 24px -8px rgba(22, 66, 55, 0.10)",
        glow: "0 0 0 1px rgba(255,255,255,0.6) inset, 0 8px 30px -8px rgba(130, 100, 209, 0.35)",
      },
      backgroundImage: {
        // The green blobs follow the chosen color theme via the CSS var;
        // the purple one stays fixed as a secondary accent.
        "hero-gradient":
          "radial-gradient(circle at 15% 20%, rgb(var(--brand-400) / 0.20), transparent 45%), radial-gradient(circle at 85% 0%, rgba(154,128,224,0.18), transparent 40%), radial-gradient(circle at 50% 100%, rgb(var(--brand-400) / 0.12), transparent 50%)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
