/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          950: "#2E1065",
        },
        ivory: {
          50: "#FEFDF9",
          100: "#FAF7F0",
          200: "#F2EDE2",
        },
        slate: {
          50: "#F9F9F9",
          100: "#F3F3F3",
          200: "#E6E6E6",
          300: "#D6D7D8",
          400: "#9CA0A3",
          500: "#6E7274",
          600: "#515457",
          700: "#3C4043",
          800: "#2E2D2C",
          900: "#1C1B1A",
          950: "#0D0F11",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        xs:   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        pop:  '0 8px 24px -6px rgb(0 0 0 / 0.12)',
        nav:  '0 1px 2px 0 rgb(0 0 0 / 0.20)',
        glow: '0 0 20px -5px rgb(124 58 237 / 0.3)',
      },
      fontFamily: {
        sans: ['"Segoe UI"', "system-ui", "-apple-system", "sans-serif"],
        display: ['"Segoe UI"', "Georgia", "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        sm: ["0.9375rem", { lineHeight: "1.375rem" }], // 15px / 22px — the whole scale hangs off this
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};
