const colors = require("@radix-ui/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ["src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        light: {
          ...Object.fromEntries(Object.values(colors.slate).map((color, index) => [`gray${index + 1}00`, color])),
        },
        dark: {
          ...Object.fromEntries(Object.values(colors.slateDark).map((color, index) => [`gray${index + 1}00`, color])),
        },
      },
    },
  },
};
