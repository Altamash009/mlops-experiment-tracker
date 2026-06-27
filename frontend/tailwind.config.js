/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {

      colors: {

        primary: "#2563EB",

        secondary: "#1E293B",

        accent: "#3B82F6",

        success: "#22C55E",

        warning: "#F59E0B",

        danger: "#EF4444",

        background: "#F8FAFC",

        card: "#FFFFFF",

      },

      boxShadow: {

        card: "0 8px 24px rgba(15,23,42,.08)",

        hover: "0 16px 32px rgba(15,23,42,.12)"

      },

      borderRadius: {

        card: "18px"

      }

    },
  },

  plugins: [],
}