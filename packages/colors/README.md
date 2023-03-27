# Accio-UI Colors

Fork of Radix Colors with OkLCH color space. Can be used with Tailwind CSS.

## Documentation

## Installation

`pnpm add @accio-ui/colors`

## Usage

### With Tailwind CSS

Simple usage, cons.: dark mode doesn't work automatically.

```js
// tailwind.config.js
/** @type {import('@accio-ui/colors')} */
const { oklch } = require("@accio-ui/colors");

module.exports = {
  darkMode: ["class"],
  theme: {
    colors: {
      ...oklch.tw_light.amber,
      // wich is the same as:
      // amber1: 'oklch(0.99431 0.00334 83.05786 / <alpha-value>)',
      // amber2: 'oklch(0.98364 0.01692 84.58640 / <alpha-value>)',
      // ...
      ...Object.fromEntries(
        Object.entries(oklch.tw_dark.amber).map(([name, color]) => [
          `dark-${name}`,
          color,
        ])
      ),
    },
  },
};
```

For dark mode works fine you have to add css variables to the globals.css file.

```tsx
/* App.tsx */
import "styles/globals.css";
import "@accio-ui/colors/dist/css/oklch-var/blue.css";
import "@accio-ui/colors/dist/css/oklch-var/blue-dark.css";
/* wich is the same as:
:root {
  --amber1: 0.99431 0.00334 83.05786;
  --amber2: 0.98364 0.01692 84.58640;
  ...
}
.dark {
  --amber1: 0.19691 0.04092 78.89376;
  --amber2: 0.21915 0.04630 74.66768;
  ...
}
*/

render(<App />);
```

and then

```js
// tailwind.config.js
const { oklch } = require("@accio-ui/colors");

module.exports = {
  darkMode: ["class"],
  theme: {
    colors: {
      ...oklch.var_tw.blue,
      // blue1: 'oklch(var(--blue1) / <alpha-value>)',
      // blue2: 'oklch(var(--blue2) / <alpha-value>)',
      // ...
    },
  },
};
```

You will need add polyfill for `oklch` to work.

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "@csstools/postcss-oklab-function": { preserve: true },
  },
};
```

<!-- hsl version the same -->

## Use Cases

There are 12 steps in each scale. Each step was designed for at least one specific use case.

This table is a simple overview of the most common use case for each step. However, there are many exceptions and caveats to factor in, which are covered in further detail below.

| Step | Use Case                                |
| ---- | --------------------------------------- |
| 1    | App background                          |
| 2    | Subtle background                       |
| 3    | UI element background                   |
| 4    | Hovered UI element background           |
| 5    | Active / Selected UI element background |
| 6    | Subtle borders and separators           |
| 7    | UI element border and focus rings       |
| 8    | Hovered UI element border               |
| 9    | Solid backgrounds                       |
| 10   | Hovered solid backgrounds               |
| 11   | Low-contrast text                       |
| 12   | High-contrast text                      |

See: https://www.radix-ui.com/docs/colors/palette-composition/understanding-the-scale

## Credits

- [radix-ui/colors](https://github.com/radix-ui/colors)
- [convert-to-oklch](https://github.com/fpetrakov/convert-to-oklch)
- [colorjs.io](https://github.com/LeaVerou/color.js)
- [postcss-oklab-function](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-oklab-function)
- [Tailwind CSS. Using CSS variables](https://tailwindcss.com/docs/customizing-colors#using-css-variables)

## Links

- [Future of colors in CSS: why I moved to oklch() from rgb(), hex, and hsl()](https://evilmartians.com/events/oklch)
- [OKLCH Color Picker & Converter](https://oklch.com)
- [chroma.js](https://github.com/gka/chroma.js)
- [culori](https://github.com/Evercoder/culori)
- [huetone](https://github.com/ardov/huetone) – A tool to create accessible color systems
- [poline](https://github.com/meodai/poline) – Esoteric Color palette Generator Mico-Lib.
