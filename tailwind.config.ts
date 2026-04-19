import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-hero",
    "bg-canvas",
    "text-ink",
    "text-sage",
    "text-sage-dark",
    "bg-sage",
    "bg-sage/10",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F0EB",
        ink:    "#2C2520",
        hero:   "#1a1714",
        sage: {
          DEFAULT: "#8FBC8F",
          light:   "#B2D4B2",
          dark:    "#6A9E6A",
        },
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      fontSize: {
        display: ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        heading: ["clamp(1.75rem, 4vw, 2.75rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        section:    "6rem",
        "section-sm": "4rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 2px 16px 0 rgba(44,37,32,0.06)",
        card: "0 4px 24px 0 rgba(44,37,32,0.08)",
        lift: "0 12px 40px 0 rgba(44,37,32,0.12)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width":    "none",
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
};

export default config;
