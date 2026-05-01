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
        yellow:  { DEFAULT: "#F5A800", pale: "#FFF8E1", dark: "#C98500" },
        ink:     "#111111",
        dark:    "#1E1E1E",
        card:    "#FAFAFA",
        off:     "#FFF8EE",
        mid:     "#6B6B6B",
        light:   "#F0F0F0",
        sage:    { DEFAULT: "#7A9E7E", pale: "#EEF5EF" },
        danger:  "#E05252",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        zh:      ["'Noto Sans SC'", "sans-serif"],
      },
      borderRadius: {
        app:  "18px",
        pill: "999px",
      },
      boxShadow: {
        card:   "0 4px 24px rgba(0,0,0,0.07)",
        yellow: "0 6px 24px rgba(245,168,0,0.28)",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blobmorph: {
          "0%,100%": { borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%" },
          "33%":     { borderRadius: "40% 60% 30% 70% / 60% 40% 60% 40%" },
          "66%":     { borderRadius: "70% 30% 50% 50% / 40% 70% 30% 60%" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse2: {
          "0%,100%": { transform: "scale(1)", opacity: "1" },
          "50%":     { transform: "scale(1.5)", opacity: "0.6" },
        },
      },
      animation: {
        fadeUp:  "fadeUp 0.6s ease forwards",
        blob:    "blobmorph 8s ease-in-out infinite",
        slideUp: "slideUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards",
        pulse2:  "pulse2 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
