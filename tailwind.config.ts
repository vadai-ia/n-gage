import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          pink: "#D6285A",
          purple: "#4A1C73",
          blue: "#1449A8",
          gold: "#D4AF37",
        },
        surface: {
          base: "#000000",
          card: "#0A0A0A",
          elevated: "#121212",
        },
        txt: {
          primary: "#FAFAFA",
          secondary: "#999999",
          muted: "#555555",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #D6285A 0%, #4A1C73 50%, #1449A8 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(214,40,90,0.1) 0%, rgba(74,28,115,0.1) 100%)",
        "gold-gradient": "linear-gradient(135deg, #D4AF37, #B5952F)",
        "card-overlay":
          "linear-gradient(to top, #000000 0%, rgba(0,0,0,0.6) 40%, transparent 80%)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        pink: "0 0 40px rgba(255,45,120,0.25)",
        blue: "0 0 40px rgba(26,110,255,0.2)",
        gold: "0 0 40px rgba(255,184,0,0.25)",
        card: "0 20px 60px rgba(0,0,0,0.6)",
      },
      animation: {
        "pulse-brand": "pulse-brand 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 1.5s linear infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "pulse-brand": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,45,120,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255,45,120,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%": { textShadow: "0 0 10px rgba(255,45,120,0.5)" },
          "100%": { textShadow: "0 0 30px rgba(255,45,120,0.9)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
