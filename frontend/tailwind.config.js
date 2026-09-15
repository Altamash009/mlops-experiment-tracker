/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        canvas: "#0a0a0a",
        "canvas-soft": "#1a1c20",
        "canvas-card": "#191919",
        "canvas-mid": "#363a3f",
        hairline: "#212327",
        primary: "#ffffff",
        ink: "#ffffff",
        body: "#dadbdf",
        "body-mid": "#7d8187",
        accent: "#ff7a17",
        "accent-sunset": "#ff7a17",
        "accent-sunset-soft": "#ffc285",
        "accent-dusk": "#7c3aed",
        "accent-twilight": "#c4b5fd",
        "accent-breeze": "#a0c3ec",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      boxShadow: {
        card: "none",
        hover: "none",
      },
      borderRadius: {
        sm: "8px",
        pill: "9999px",
        card: "8px",
      }
    },
  },

  plugins: [],
}