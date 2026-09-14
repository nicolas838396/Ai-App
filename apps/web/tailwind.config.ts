import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f7f5",
          100: "#dcece5",
          500: "#3f8a72",
          600: "#33705c",
          700: "#295a49",
        },
      },
    },
  },
  plugins: [],
};

export default config;
