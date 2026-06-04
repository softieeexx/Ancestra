import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ritual: {
          DEFAULT: "#D4A853",
          light: "#F0D68A",
          dark: "#A67C2E",
        },
        earth: {
          50: "#FDF8F0",
          100: "#F5E6C8",
          200: "#D4A853",
          300: "#8B6914",
          400: "#5C4510",
          500: "#3A2B0A",
          600: "#1A1507",
          700: "#0D0A03",
          800: "#060401",
          900: "#020100",
        },
        accent: {
          amina: "#4ADE80",
          nefertiti: "#FBBF24",
          yaa: "#F87171",
        },
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        cinzel: ["Cinzel", "serif"],
        cormorant: ["Cormorant Garamond", "Georgia", "serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "ancestral-pattern": "url('/patterns/pattern.svg')",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(212, 168, 83, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(212, 168, 83, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
