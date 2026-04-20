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
          pink: "#FF2D78",
          purple: "#7B2FBE",
          blue: "#1A6EFF",
          gold: "#FFB800",
        },
        surface: {
          base: "#07070F",
          card: "#0F0F1A",
          elevated: "#161625",
        },
        txt: {
          primary: "#F0F0FF",
          secondary: "#8585A8",
          muted: "#44445A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(255,45,120,0.15) 0%, rgba(123,47,190,0.15) 100%)",
        "gold-gradient": "linear-gradient(135deg, #FFB800, #FF6B00)",
        "card-overlay": "linear-gradient(to top, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.5) 40%, transparent 70%)",
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
    },
  },
  plugins: [],
};
export default config;
