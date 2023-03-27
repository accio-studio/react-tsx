/** @type {import('@accio-ui/colors')} */
const { oklch } = require("@accio-ui/colors");
const baseConfig = require("../../tailwind.config.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  darkMode: ["class"],
  content: [...baseConfig.content, "./stories/**/*.{ts,tsx}", ".storybook/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ...oklch.tw_light.amber,
        ...Object.fromEntries(Object.entries(oklch.tw_dark.amber).map(([name, color]) => [`dark-${name}`, color])),
        ...oklch.var_tw.slate,
        ...oklch.var_tw.blue,
      },
    },
  },
};
