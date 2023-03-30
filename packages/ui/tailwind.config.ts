import { Config } from "tailwindcss";

import baseConfig from "../../tailwind.config.js";
import { oklch } from "@accio-ui/colors";

export default {
  ...baseConfig,
  darkMode: ["class"],
  content: [...baseConfig.content, "./stories/**/*.{ts,tsx}", ".storybook/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // BW
        ...oklch.blackA,
        ...oklch.whiteA,
        // COLORS
        ...oklch.var_tw.amber,
        ...oklch.var_tw.blue,
        ...oklch.var_tw.bronze,
        ...oklch.var_tw.brown,
        ...oklch.var_tw.crimson,
        ...oklch.var_tw.cyan,
        ...oklch.var_tw.gold,
        ...oklch.var_tw.grass,
        ...oklch.var_tw.green,
        ...oklch.var_tw.indigo,
        ...oklch.var_tw.lime,
        ...oklch.var_tw.mint,
        ...oklch.var_tw.orange,
        ...oklch.var_tw.pink,
        ...oklch.var_tw.plum,
        ...oklch.var_tw.purple,
        ...oklch.var_tw.red,
        ...oklch.var_tw.sky,
        ...oklch.var_tw.teal,
        ...oklch.var_tw.tomato,
        ...oklch.var_tw.violet,
        ...oklch.var_tw.yellow,
        // light with alpha
        ...oklch.light_a.amberA,
        ...oklch.light_a.blueA,
        ...oklch.light_a.bronzeA,
        ...oklch.light_a.brownA,
        ...oklch.light_a.crimsonA,
        ...oklch.light_a.cyanA,
        ...oklch.light_a.goldA,
        ...oklch.light_a.grassA,
        ...oklch.light_a.greenA,
        ...oklch.light_a.indigoA,
        ...oklch.light_a.limeA,
        ...oklch.light_a.mintA,
        ...oklch.light_a.orangeA,
        ...oklch.light_a.pinkA,
        ...oklch.light_a.plumA,
        ...oklch.light_a.purpleA,
        ...oklch.light_a.redA,
        ...oklch.light_a.skyA,
        ...oklch.light_a.tealA,
        ...oklch.light_a.tomatoA,
        ...oklch.light_a.violetA,
        ...oklch.light_a.yellowA,
        // dark with alpha
        ...oklch.dark_a.amberDarkA,
        ...oklch.dark_a.blueDarkA,
        ...oklch.dark_a.bronzeDarkA,
        ...oklch.dark_a.brownDarkA,
        ...oklch.dark_a.crimsonDarkA,
        ...oklch.dark_a.cyanDarkA,
        ...oklch.dark_a.goldDarkA,
        ...oklch.dark_a.grassDarkA,
        ...oklch.dark_a.greenDarkA,
        ...oklch.dark_a.indigoDarkA,
        ...oklch.dark_a.limeDarkA,
        ...oklch.dark_a.mintDarkA,
        ...oklch.dark_a.orangeDarkA,
        ...oklch.dark_a.pinkDarkA,
        ...oklch.dark_a.plumDarkA,
        ...oklch.dark_a.purpleDarkA,
        ...oklch.dark_a.redDarkA,
        ...oklch.dark_a.skyDarkA,
        ...oklch.dark_a.tealDarkA,
        ...oklch.dark_a.tomatoDarkA,
        ...oklch.dark_a.violetDarkA,
        ...oklch.dark_a.yellowDarkA,
        // GRAYS
        ...oklch.var_tw.gray,
        ...oklch.var_tw.mauve,
        ...oklch.var_tw.olive,
        ...oklch.var_tw.slate,
        ...oklch.var_tw.sage,
        ...oklch.var_tw.sand,
        // light with alpha
        ...oklch.light_a.grayA,
        ...oklch.light_a.mauveA,
        ...oklch.light_a.oliveA,
        ...oklch.light_a.slateA,
        ...oklch.light_a.sageA,
        ...oklch.light_a.sandA,
        // dark with alpha
        ...oklch.dark_a.grayDarkA,
        ...oklch.dark_a.mauveDarkA,
        ...oklch.dark_a.oliveDarkA,
        ...oklch.dark_a.slateDarkA,
        ...oklch.dark_a.sageDarkA,
        ...oklch.dark_a.sandDarkA,
      },
    },
  },
} satisfies Config;
