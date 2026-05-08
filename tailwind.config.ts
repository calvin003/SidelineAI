import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        bg2: "#F7F7F7",
        bg3: "#EEEEEE",
        bg4: "#E4E4E4",
        ink: "#111111",
        ink2: "#666666",
        ink3: "#AAAAAA",
        rule: "rgba(0,0,0,0.08)",
        ruleHover: "rgba(0,0,0,0.20)",
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,.05), 0 4px 14px rgba(0,0,0,.04)",
        lifted: "0 8px 40px rgba(0,0,0,.07), 0 2px 8px rgba(0,0,0,.04)",
        hero: "0 24px 64px rgba(0,0,0,.18)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-2.5px",
        tighter2: "-2px",
        tighter1: "-1px",
        eyebrow: "0.06em",
        eyebrowWide: "0.1em",
      },
      keyframes: {
        pulseDot: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        bob: {
          "0%,100%": { transform: "translate(-50%, 0)" },
          "50%": { transform: "translate(-50%, 7px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%,80%,100%": { opacity: "0.2" },
          "40%": { opacity: "1" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s infinite",
        bob: "bob 2.2s ease-in-out infinite",
        fadeUp: "fadeUp 0.3s ease both",
        blink: "blink 1.2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
