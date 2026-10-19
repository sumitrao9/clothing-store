/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c140d",
        charcoal: "#2a1f15",
        smoke: "#3a2c1f",
        beige: "#ddccb8",
        sand: "#ece2d4",
        ivory: "#f7f2ea",
        cream: "#fffdf9",
        accent: "#6f4a2f",
        "accent-soft": "#a9794f",
        "accent-deep": "#4a2e1a",
        muted: "#8a7a68"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "Helvetica Neue", "Arial", "sans-serif"]
      },
      letterSpacing: { widest: "0.28em", wider2: "0.18em" },
      maxWidth: { container: "1280px" },
      borderRadius: { xs: "10px", sm: "14px", DEFAULT: "18px", lg: "26px", pill: "999px" },
      boxShadow: {
        sm: "0 1px 2px rgba(20,17,14,.05), 0 4px 14px rgba(20,17,14,.06)",
        DEFAULT: "0 10px 30px -12px rgba(20,17,14,.18), 0 2px 8px rgba(20,17,14,.05)",
        lg: "0 30px 60px -22px rgba(20,17,14,.30), 0 6px 18px rgba(20,17,14,.08)",
        accent: "0 16px 34px -16px rgba(176,141,87,.55)"
      },
      transitionTimingFunction: { lux: "cubic-bezier(0.22, 1, 0.36, 1)" }
    }
  },
  plugins: []
};
