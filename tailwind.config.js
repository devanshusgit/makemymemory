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
        // Keep canvas/hero for backward compat
        canvas:     "#FAF8F4",
        hero:       "#1A1A1A",
        // Remove sage — replaced by gold
        sage: {
          DEFAULT: "#C9A84C",
          light:   "#E8D5A3",
          dark:    "#A07C2E",
        },
        // shadcn/ui theme tokens (Tailwind v3 mapping) — sourced from the CSS
        // variables in globals.css, which are themselves set to this site's
        // existing brand palette rather than shadcn's generic defaults.
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--ink)",
        },
        border: "var(--border)",
        input:  "var(--input)",
        ring:   "var(--ring)",
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
        sidebar: {
          DEFAULT:            "var(--sidebar)",
          foreground:         "var(--sidebar-foreground)",
          primary:            "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent:             "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border:             "var(--sidebar-border)",
          ring:               "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans:    ["var(--font-dm-sans)", "sans-serif"],
        serif:   ["var(--font-cormorant)", "serif"],
        display: ["var(--font-cormorant)", "serif"],
        brand:   ["var(--font-ibm-plex-serif)", "serif"],
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
