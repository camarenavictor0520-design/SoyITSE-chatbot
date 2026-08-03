/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1615",
          900: "#0F1E1C",
          800: "#16302C",
          700: "#1E4038",
        },
        gold: {
          400: "#D9AE5C",
          500: "#C79A46",
        },
        coral: {
          400: "#E8735F",
          500: "#D6604C",
        },
        mist: {
          100: "#F3F1E8",
          200: "#D9DCD3",
          400: "#8FA39B",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        wave1: "wave 1s ease-in-out infinite",
        wave2: "wave 1s ease-in-out infinite 0.15s",
        wave3: "wave 1s ease-in-out infinite 0.3s",
        wave4: "wave 1s ease-in-out infinite 0.45s",
      },
    },
  },
  plugins: [],
};
