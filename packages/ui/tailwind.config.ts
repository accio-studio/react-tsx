import { Config } from "tailwindcss";

import baseConfig from "../../tailwind.config.js";
import * as oklch from "@accio-ui/colors";

export default {
  ...baseConfig,
  darkMode: ["class"],
  content: [...baseConfig.content, "./stories/**/*.{ts,tsx}", ".storybook/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // bw
        ...oklch.black_a,
        ...oklch.white_a,
        // colors
        ...oklch.amber,
        ...oklch.blue,
        ...oklch.bronze,
        ...oklch.brown,
        ...oklch.crimson,
        ...oklch.cyan,
        ...oklch.gold,
        ...oklch.grass,
        ...oklch.green,
        ...oklch.indigo,
        ...oklch.lime,
        ...oklch.mint,
        ...oklch.orange,
        ...oklch.pink,
        ...oklch.plum,
        ...oklch.purple,
        ...oklch.red,
        ...oklch.sky,
        ...oklch.teal,
        ...oklch.tomato,
        ...oklch.violet,
        ...oklch.yellow,
        // colors with alpha
        ...oklch.amber_a,
        ...oklch.blue_a,
        ...oklch.bronze_a,
        ...oklch.brown_a,
        ...oklch.crimson_a,
        ...oklch.cyan_a,
        ...oklch.gold_a,
        ...oklch.grass_a,
        ...oklch.green_a,
        ...oklch.indigo_a,
        ...oklch.lime_a,
        ...oklch.mint_a,
        ...oklch.orange_a,
        ...oklch.pink_a,
        ...oklch.plum_a,
        ...oklch.purple_a,
        ...oklch.red_a,
        ...oklch.sky_a,
        ...oklch.teal_a,
        ...oklch.tomato_a,
        ...oklch.violet_a,
        ...oklch.yellow_a,
        // GRAYS
        ...oklch.gray,
        ...oklch.mauve,
        ...oklch.olive,
        ...oklch.slate,
        ...oklch.sage,
        ...oklch.sand,
        // grays with alpha
        ...oklch.gray_a,
        ...oklch.mauve_a,
        ...oklch.olive_a,
        ...oklch.slate_a,
        ...oklch.sage_a,
        ...oklch.sand_a,
      },
    },
  },
} satisfies Config;
