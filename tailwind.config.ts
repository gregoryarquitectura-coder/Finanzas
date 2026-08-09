import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#161513",
          light: "#201e1b",
          lighter: "#2a2723",
        },
        gold: {
          DEFAULT: "#D1A25E",
          dim: "#a9814a",
        },
        champagne: "#CEAE85",
        stone: "#6B655C",
        amber: {
          DEFAULT: "#FFA641",
          glow: "#FFC98A",
        },
      },
      fontFamily: {
        display: ["var(--font-bodoni)", "Georgia", "serif"],
        label: ["var(--font-montserrat)", "Arial", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(209,162,94,0.12) inset, 0 20px 45px -22px rgba(0,0,0,0.85)",
        glow: "0 0 18px 2px rgba(255,166,65,0.35)",
      },
      backgroundImage: {
        "brushed-metal":
          "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.15) 100%)",
        "radial-fade":
          "radial-gradient(120% 120% at 50% 0%, rgba(209,162,94,0.08) 0%, rgba(22,21,19,0) 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
