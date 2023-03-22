const baseConfig = require("../../tailwind.config.js");
/** @type {import('@accio-ui/colors')} */
const { oklch } = require("@accio-ui/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ...oklch.var_tw.slate,
      },
    },
  },
};
