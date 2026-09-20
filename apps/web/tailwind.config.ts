import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0faf6",
          100: "#dbf3e8",
          200: "#b8e6d3",
          300: "#8ad3b8",
          400: "#57b998",
          500: "#339d7c",
          600: "#247f64",
          700: "#1e6551",
          800: "#1a5142",
          900: "#164237",
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
        "hero-gradient":
          "radial-gradient(circle at 15% 20%, rgba(87,185,152,0.20), transparent 45%), radial-gradient(circle at 85% 0%, rgba(154,128,224,0.18), transparent 40%), radial-gradient(circle at 50% 100%, rgba(87,185,152,0.12), transparent 50%)",
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
