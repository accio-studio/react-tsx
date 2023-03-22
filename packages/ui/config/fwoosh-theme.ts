import { ThemeObject } from "@fwoosh/types";
import { blue, blueDark, slate, slateDark } from "@radix-ui/colors";

export const themes: ThemeObject[] = [
  {
    type: "light",
    class: "light",
    tokens: {
      colors: {
        ...(Object.fromEntries(Object.values(slate).map((color, index) => [`gray${index}`, color])) as Record<
          string,
          string
        >),
        ...(Object.fromEntries(Object.values(blue).map((color, index) => [`primary${index}`, color])) as Record<
          string,
          string
        >),
      },
    },
  },
  {
    type: "dark",
    class: "dark",
    tokens: {
      colors: {
        ...(Object.fromEntries(Object.values(slateDark).map((color, index) => [`gray${index}`, color])) as Record<
          string,
          string
        >),
        ...(Object.fromEntries(Object.values(blueDark).map((color, index) => [`primary${index}`, color])) as Record<
          string,
          string
        >),
      },
    },
  },
];
