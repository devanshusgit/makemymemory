/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-cream", "bg-cream-dark", "text-ink", "text-gold", "text-gold-dark",
    "bg-gold", "bg-ink", "border-gold",
  ],
  theme: {
    extend: {
      colors: {
        // New brand tokens
        cream:      "#FAF8F4",
        "cream-dark": "#F0EBE1",
        ink:        "#1A1A1A",
        gold: {
          DEFAULT: "#C9A84C",
          light:   "#E8D5A3",
          dark:    "#A07C2E",
        },
        muted:      "#6B6560",
        // Keep canvas/hero for backward compat
        canvas:     "#FAF8F4",
        hero:       "#1A1A1A",
        // Remove sage — replaced by gold
        sage: {
          DEFAULT: "#C9A84C",
          light:   "#E8D5A3",
          dark:    "#A07C2E",
        },
      },
      fontFamily: {
        sans:    ["var(--font-dm-sans)", "sans-serif"],
        serif:   ["var(--font-cormorant)", "serif"],
        display: ["var(--font-cormorant)", "serif"],
      },
      fontSize: {
        display: ["clamp(2.5rem, 6vw, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        heading: ["clamp(1.75rem, 4vw, 2.75rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        section:      "6rem",
        "section-sm": "4rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 2px 16px 0 rgba(26,26,26,0.06)",
        card: "0 4px 24px 0 rgba(26,26,26,0.08)",
        lift: "0 12px 40px 0 rgba(26,26,26,0.12)",
        gold: "0 4px 20px 0 rgba(201,168,76,0.25)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
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
