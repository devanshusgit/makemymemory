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
        // Core palette
        canvas: "#F5F0EB",       // primary background
        ink: "#2C2520",          // dark text
        hero: "#1a1714",         // dark hero sections
        sage: {
          DEFAULT: "#8FBC8F",    // accent green
          light: "#B2D4B2",
          dark: "#6A9E6A",
        },
        // Warm neutrals — readable on canvas (#F5F0EB)
        stone: {
          50:  "#FAF7F4",
          100: "#F5F0EB",
          200: "#EDE5DC",
          300: "#D6C9BC",
          400: "#9C8878",
          500: "#6B5B4E",
          600: "#4A3D34",
          700: "#3A2E27",
          800: "#2E231D",
          900: "#1a1714",
        },
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      fontSize: {
        "display": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "heading":  ["clamp(1.75rem, 4vw, 2.75rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "section": "6rem",
        "section-sm": "4rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "soft":  "0 2px 16px 0 rgba(44,37,32,0.06)",
        "card":  "0 4px 24px 0 rgba(44,37,32,0.08)",
        "lift":  "0 12px 40px 0 rgba(44,37,32,0.12)",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [
    // Hide scrollbar utility used in filter bar
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
};

export default config;
