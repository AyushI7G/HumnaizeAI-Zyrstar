/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0A0B",
          900: "#111113",
          800: "#1A1A1D",
          700: "#28282C",
          600: "#3A3A40",
        },
        mist: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D1D1D6",
          400: "#9A9AA2",
          500: "#6E6E76",
        },
        brand: {
          50: "#EEF4FF",
          100: "#DCE8FF",
          300: "#9FBFFF",
          500: "#4C7DFF",
          600: "#3763EB",
          700: "#2C4FC4",
          900: "#1B2E75",
        },
        signal: {
          green: "#1F9D55",
          amber: "#B7791F",
          red: "#C0362C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,10,11,0.04), 0 4px 16px rgba(10,10,11,0.06)",
        elevated: "0 8px 30px rgba(10,10,11,0.10)",
      },
    },
  },
  plugins: [],
};
