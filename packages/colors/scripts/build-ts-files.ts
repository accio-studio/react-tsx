import Color from "colorjs.io";
import fs from "node:fs/promises";
import path from "node:path";

// import * as colors_bw from "../src/hsl/bw";
// import * as colors_dark from "../src/hsl/dark";
// import * as colors_light from "../src/hsl/light";

/**
 * Convert from HSL to OKLCH.
 * TODO:
 * 1. read from src all files
 * 2. convert from HSL to OKLCH
 *  - create ts files content
 *  - create index.ts files content
 * 3. save files in tmp dir
 *  - hls
 *    - light
 *    - light-a
 *    - dark
 *    - dark-a
 *    - bw-a
 *    - tw-light
 *    - tw-dark
 *    - var-light
 *    - var-dark
 *    - var-tw
 *  - oklch
 *    - light
 *    - light-a
 *    - dark
 *    - dark-a
 *    - bw-a
 *    - tw-light
 *    - tw-dark
 *    - var-light
 *    - var-dark
 *    - var-tw
 * 4. build css files
 *  - hls
 *  - hls-var
 *  - oklch
 *  - oklch-var
 * 5. build js
 * 6. rm tmp dir
 */

// read from src all colors
import * as hsl_colors from "../src/hsl";

const src_dir = path.join(__dirname, "../src/hsl");
const out_dir = path.resolve(__dirname, "../tmp");

async function mkdir(dir: string) {
  await fs.stat(dir).catch(() => fs.mkdir(path.join(dir)));
}

const indexes = {
  hsl: new Set<string>(),
  hsl_bw_a: new Set<string>(),
  hsl_light: new Set<string>(),
  hsl_light_a: new Set<string>(),
  hsl_dark: new Set<string>(),
  hsl_dark_a: new Set<string>(),
  hsl_tw_light: new Set<string>(),
  hsl_tw_dark: new Set<string>(),
  hsl_var_light: new Set<string>(),
  hsl_var_dark: new Set<string>(),
  hsl_var_tw: new Set<string>(),
  oklch: new Set<string>(),
  oklch_bw_a: new Set<string>(),
  oklch_light: new Set<string>(),
  oklch_light_a: new Set<string>(),
  oklch_dark: new Set<string>(),
  oklch_dark_a: new Set<string>(),
  oklch_tw_light: new Set<string>(),
  oklch_tw_dark: new Set<string>(),
  oklch_var_light: new Set<string>(),
  oklch_var_dark: new Set<string>(),
  oklch_var_tw: new Set<string>(),
} satisfies Record<string, Set<string>>;

async function buildHSL() {
  // create tmp/hsl dir
  await mkdir(path.join(out_dir, "hsl"));
  // create tmp/hsl/bw-a dir
  await mkdir(path.join(out_dir, "hsl", "bw-a"));
  // create tmp/hsl/light dir
  await mkdir(path.join(out_dir, "hsl", "light"));
  // create tmp/hsl/light-a dir
  await mkdir(path.join(out_dir, "hsl", "light-a"));
  // create tmp/hsl/dark dir
  await mkdir(path.join(out_dir, "hsl", "dark"));
  // create tmp/hsl/dark-a dir
  await mkdir(path.join(out_dir, "hsl", "dark-a"));
  // create tmp/hsl/hsl/tw-light dir
  await mkdir(path.join(out_dir, "hsl", "tw-light"));
  // create tmp/hsl/hsl/tw-dark dir
  await mkdir(path.join(out_dir, "hsl", "tw-dark"));
  // create tmp/hsl/hsl/var-light dir
  await mkdir(path.join(out_dir, "hsl", "var-light"));
  // create tmp/hsl/hsl/var-dark dir
  await mkdir(path.join(out_dir, "hsl", "var-dark"));
  // create tmp/hsl/hsl/var-tw dir
  await mkdir(path.join(out_dir, "hsl", "var-tw"));
  // map over all colors
  await Promise.allSettled(
    Object.entries(hsl_colors).map(async ([color_scale_name, scale]) => {
      const is_dark = /Dark$/.test(color_scale_name);
      const is_dark_a = /DarkA$/.test(color_scale_name);
      const is_bw_a = /blackA$|whiteA$/.test(color_scale_name);
      const is_light_a = !(is_dark || is_dark_a || is_bw_a) && /A$/.test(color_scale_name);
      const is_light = !(is_dark || is_dark_a || is_light_a || is_bw_a);
      const name = color_scale_name.replace(/Dark/, "");
      if (is_bw_a) {
        // copy src/hsl to tmp/hsl/bw-a
        await fs.copyFile(path.join(src_dir, "bw", `${name}.ts`), path.join(out_dir, "hsl", "bw-a", `${name}.ts`));
        // add to indexes
        indexes.hsl_bw_a.add(`export { ${name} } from "./${name}";`);
      }
      if (is_light) {
        // copy src/hsl to tmp/hsl/light
        await fs.copyFile(path.join(src_dir, "light", `${name}.ts`), path.join(out_dir, "hsl", "light", `${name}.ts`));
        // add to indexes
        indexes.hsl_light.add(`export { ${name} } from "./${name}";`);
        // convert to tw (add alpha-value)
        const scale_as_hsl_tw_properties = Object.entries(scale)
          .map(
            ([name, value]) =>
              `  ${name}: "hsla(${new Color(value)
                .toJSON()
                .coords.map((x, i) => x.toPrecision(5) + (i > 0 ? "%" : ""))
                .join(", ")}, <alpha-value>)",`,
          )
          .join("\n");
        const result_hsl_tw = `export const ${name} = {\n${scale_as_hsl_tw_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "hsl", "tw-light", `${name}.ts`), result_hsl_tw);
        // add to indexes
        indexes.hsl_tw_light.add(`export { ${name} } from "./${name}";`);
        // convert to hsl-var
        const scale_as_hsl_var_properties = Object.entries(scale)
          .map(
            ([name, value]) =>
              `  ${name}: "${new Color(value)
                .toJSON()
                .coords.map((x, i) => x.toPrecision(5) + (i > 0 ? "%" : ""))
                .join(", ")}",`,
          )
          .join("\n");
        const result_hsl_var = `export const ${name} = {\n${scale_as_hsl_var_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "hsl", "var-light", `${name}.ts`), result_hsl_var);
        // add to indexes
        indexes.hsl_var_light.add(`export { ${name} } from "./${name}";`);
        // write to var-tw only one set of colors
        const scale_as_hsl_var_tw_properties = Object.keys(scale)
          .map((name) => `  ${name}: "hsla(var(--${name}), <alpha-value>)",`)
          .join("\n");
        const result_hsl_var_tw = `export const ${name} = {\n${scale_as_hsl_var_tw_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "hsl", "var-tw", `${name}.ts`), result_hsl_var_tw);
        // add to indexes
        indexes.hsl_var_tw.add(`export { ${name} } from "./${name}";`);
      }
      if (is_light_a) {
        // copy src/hsl to tmp/hsl/light-a
        await fs.copyFile(
          path.join(src_dir, "light", `${name}.ts`),
          path.join(out_dir, "hsl", "light-a", `${name}.ts`),
        );
        // add to indexes
        indexes.hsl_light_a.add(`export { ${name} } from "./${name}";`);
      }
      if (is_dark) {
        // copy src/hsl to tmp/hsl/dark
        await fs.copyFile(path.join(src_dir, "dark", `${name}.ts`), path.join(out_dir, "hsl", "dark", `${name}.ts`));
        // add to indexes
        indexes.hsl_dark.add(`export { ${name}} from "./${name}";`);
        // convert to tw (add alpha-value)
        const scale_as_hsl_tw_properties = Object.entries(scale)
          .map(
            ([name, value]) =>
              `  ${name}: "hsla(${new Color(value)
                .toJSON()
                .coords.map((x, i) => x.toPrecision(5) + (i > 0 ? "%" : ""))
                .join(", ")}, <alpha-value>)",`,
          )
          .join("\n");
        const result_hsl_tw = `export const ${name} = {\n${scale_as_hsl_tw_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "hsl", "tw-dark", `${name}.ts`), result_hsl_tw);
        // add to indexes
        indexes.hsl_tw_dark.add(`export { ${name}} from "./${name}";`);
        // convert to hsl-var
        const scale_as_hsl_var_properties = Object.entries(scale)
          .map(
            ([name, value]) =>
              `  ${name}: "${new Color(value)
                .toJSON()
                .coords.map((x, i) => x.toPrecision(5) + (i > 0 ? "%" : ""))
                .join(", ")}",`,
          )
          .join("\n");
        const result_hsl_var = `export const ${name} = {\n${scale_as_hsl_var_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "hsl", "var-dark", `${name}.ts`), result_hsl_var);
        // add to indexes
        indexes.hsl_var_dark.add(`export { ${name}} from "./${name}";`);
      }
      if (is_dark_a) {
        // copy src/hsl to tmp/hsl/dark-a
        await fs.copyFile(path.join(src_dir, "dark", `${name}.ts`), path.join(out_dir, "hsl", "dark-a", `${name}.ts`));
        // add to indexes
        indexes.hsl_dark_a.add(`export { ${name} as ${name.replace(/A/, "")}DarkA } from "./${name}";`);
      }
    }),
  );
  // write hsl/bw-a index.ts
  await fs.writeFile(path.join(out_dir, "hsl", "bw-a", "index.ts"), [...indexes.hsl_bw_a.values()].join("\n"));
  // write hsl/light index.ts
  await fs.writeFile(path.join(out_dir, "hsl", "light", "index.ts"), [...indexes.hsl_light.values()].join("\n"));
  // write hsl/light-a index.ts
  await fs.writeFile(path.join(out_dir, "hsl", "light-a", "index.ts"), [...indexes.hsl_light_a.values()].join("\n"));
  // write hsl/dark index.ts
  await fs.writeFile(path.join(out_dir, "hsl", "dark", "index.ts"), [...indexes.hsl_dark.values()].join("\n"));
  // write hsl/dark-a index.ts
  await fs.writeFile(path.join(out_dir, "hsl", "dark-a", "index.ts"), [...indexes.hsl_dark_a.values()].join("\n"));
  // write hsl/tw-light index.ts
  await fs.writeFile(path.join(out_dir, "hsl", "tw-light", "index.ts"), [...indexes.hsl_tw_light.values()].join("\n"));
  // write hsl/tw-dark index.ts
  await fs.writeFile(path.join(out_dir, "hsl", "tw-dark", "index.ts"), [...indexes.hsl_tw_dark.values()].join("\n"));
  // write hsl/var-light index.ts
  await fs.writeFile(
    path.join(out_dir, "hsl", "var-light", "index.ts"),
    [...indexes.hsl_var_light.values()].join("\n"),
  );
  // write hsl/var-dark index.ts
  await fs.writeFile(path.join(out_dir, "hsl", "var-dark", "index.ts"), [...indexes.hsl_var_dark.values()].join("\n"));
  // write hsl/var-tw index.ts
  await fs.writeFile(path.join(out_dir, "hsl", "var-tw", "index.ts"), [...indexes.hsl_var_tw.values()].join("\n"));
  // write hsl index.ts
  await fs.writeFile(
    path.join(out_dir, "hsl", "index.ts"),
    "export * from './bw-a';\n" +
      "export * as light from './light';\n" +
      "export * as light_a from './light-a';\n" +
      "export * as dark from './dark';\n" +
      "export * as dark_a from './dark-a';\n" +
      "export * as tw_light from './tw-light';\n" +
      "export * as tw_dark from './tw-dark';\n" +
      "export * as var_light from './var-light';\n" +
      "export * as var_dark from './var-dark';\n" +
      "export * as var_tw from './var-tw';\n",
  );
}

async function buildOKLCH() {
  // create tmp/oklch dir
  await mkdir(path.join(out_dir, "oklch"));
  // create tmp/oklch/bw-a dir
  await mkdir(path.join(out_dir, "oklch", "bw-a"));
  // create tmp/oklch/light dir
  await mkdir(path.join(out_dir, "oklch", "light"));
  // create tmp/oklch/light-a dir
  await mkdir(path.join(out_dir, "oklch", "light-a"));
  // create tmp/oklch/dark dir
  await mkdir(path.join(out_dir, "oklch", "dark"));
  // create tmp/oklch/dark-a dir
  await mkdir(path.join(out_dir, "oklch", "dark-a"));
  // create tmp/oklch/oklch/tw-light dir
  await mkdir(path.join(out_dir, "oklch", "tw-light"));
  // create tmp/oklch/oklch/tw-dark dir
  await mkdir(path.join(out_dir, "oklch", "tw-dark"));
  // create tmp/oklch/oklch/var-light dir
  await mkdir(path.join(out_dir, "oklch", "var-light"));
  // create tmp/oklch/oklch/var-dark dir
  await mkdir(path.join(out_dir, "oklch", "var-dark"));
  // create tmp/oklch/oklch/var-tw dir
  await mkdir(path.join(out_dir, "oklch", "var-tw"));
  // map over all colors
  await Promise.allSettled(
    Object.entries(hsl_colors).map(async ([color_scale_name, scale]) => {
      const is_dark = /Dark$/.test(color_scale_name);
      const is_dark_a = /DarkA$/.test(color_scale_name);
      const is_bw_a = /blackA$|whiteA$/.test(color_scale_name);
      const is_light_a = !(is_dark || is_dark_a || is_bw_a) && /A$/.test(color_scale_name);
      const is_light = !(is_dark || is_dark_a || is_light_a || is_bw_a);
      const name = color_scale_name.replace(/Dark/, "");
      if (is_bw_a) {
        // convert to tmp/oklch/bw-a
        const scale_as_oklch_bw_a_properties = Object.entries(scale)
          .map(([name, value]) => `  ${name}: "${new Color(value).to("oklch").toString({ precision: 5 })}",`)
          .join("\n");
        const result_oklch_bw_a = `export const ${name} = {\n${scale_as_oklch_bw_a_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "bw-a", `${name}.ts`), result_oklch_bw_a);
        // add to indexes
        indexes.oklch_bw_a.add(`export { ${name} } from "./${name}";`);
      }
      if (is_light) {
        // convert to tmp/oklch/light
        const scale_as_oklch_light_properties = Object.entries(scale)
          .map(([name, value]) => `  ${name}: "${new Color(value).to("oklch").toString({ precision: 5 })}",`)
          .join("\n");
        const result_oklch_light = `export const ${name} = {\n${scale_as_oklch_light_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "light", `${name}.ts`), result_oklch_light);
        // add to indexes
        indexes.oklch_light.add(`export { ${name} } from "./${name}";`);
        // convert to tw (add alpha-value)
        const scale_as_oklch_tw_properties = Object.entries(scale)
          .map(
            ([name, value]) =>
              `  ${name}: "oklch(${new Color(value)
                .to("oklch")
                .toJSON()
                .coords.map((x) => x.toPrecision(5))
                .join(" ")} / <alpha-value>)",`,
          )
          .join("\n");
        const result_oklch_tw = `export const ${name} = {\n${scale_as_oklch_tw_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "tw-light", `${name}.ts`), result_oklch_tw);
        // add to indexes
        indexes.oklch_tw_light.add(`export { ${name} } from "./${name}";`);
        // convert to oklch-var
        const scale_as_oklch_var_properties = Object.entries(scale)
          .map(
            ([name, value]) =>
              `  ${name}: "${new Color(value)
                .to("oklch")
                .toJSON()
                .coords.map((x) => x.toPrecision(5))
                .join(" ")}",`,
          )
          .join("\n");
        const result_oklch_var = `export const ${name} = {\n${scale_as_oklch_var_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "var-light", `${name}.ts`), result_oklch_var);
        // add to indexes
        indexes.oklch_var_light.add(`export { ${name} } from "./${name}";`);
        // write to var-tw only one set of colors
        const scale_as_oklch_var_tw_properties = Object.keys(scale)
          .map((name) => `  ${name}: "oklch(var(--${name}) / <alpha-value>)",`)
          .join("\n");
        const result_oklch_var_tw = `export const ${name} = {\n${scale_as_oklch_var_tw_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "var-tw", `${name}.ts`), result_oklch_var_tw);
        // add to indexes
        indexes.oklch_var_tw.add(`export { ${name} } from "./${name}";`);
      }
      if (is_light_a) {
        // convert to tmp/oklch/light-a
        const scale_as_oklch_light_a_properties = Object.entries(scale)
          .map(([name, value]) => `  ${name}: "${new Color(value).to("oklch").toString({ precision: 5 })}",`)
          .join("\n");
        const result_oklch_light_a = `export const ${name} = {\n${scale_as_oklch_light_a_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "light-a", `${name}.ts`), result_oklch_light_a);
        // add to indexes
        indexes.oklch_light_a.add(`export { ${name} } from "./${name}";`);
      }
      if (is_dark) {
        // convert to tmp/oklch/dark
        const scale_as_oklch_dark_properties = Object.entries(scale)
          .map(([name, value]) => `  ${name}: "${new Color(value).to("oklch").toString({ precision: 5 })}",`)
          .join("\n");
        const result_oklch_dark = `export const ${name} = {\n${scale_as_oklch_dark_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "dark", `${name}.ts`), result_oklch_dark);
        // add to indexes
        indexes.oklch_dark.add(`export { ${name}} from "./${name}";`);
        // convert to tw (add alpha-value)
        const scale_as_oklch_tw_properties = Object.entries(scale)
          .map(
            ([name, value]) =>
              `  ${name}: "oklch(${new Color(value)
                .to("oklch")
                .toJSON()
                .coords.map((x) => x.toPrecision(5))
                .join(" ")} / <alpha-value>)",`,
          )
          .join("\n");
        const result_oklch_tw = `export const ${name} = {\n${scale_as_oklch_tw_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "tw-dark", `${name}.ts`), result_oklch_tw);
        // add to indexes
        indexes.oklch_tw_dark.add(`export { ${name}} from "./${name}";`);
        // convert to oklch-var
        const scale_as_oklch_var_properties = Object.entries(scale)
          .map(
            ([name, value]) =>
              `  ${name}: "${new Color(value)
                .to("oklch")
                .toJSON()
                .coords.map((x) => x.toPrecision(5))
                .join(" ")}",`,
          )
          .join("\n");
        const result_oklch_var = `export const ${name} = {\n${scale_as_oklch_var_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "var-dark", `${name}.ts`), result_oklch_var);
        // add to indexes
        indexes.oklch_var_dark.add(`export { ${name}} from "./${name}";`);
      }
      if (is_dark_a) {
        // convert to tmp/oklch/dark-a
        const scale_as_oklch_dark_a_properties = Object.entries(scale)
          .map(
            ([name, value]) =>
              `  ${name.replace(/A/, "DarkA")}: "${new Color(value).to("oklch").toString({ precision: 5 })}",`,
          )
          .join("\n");
        const result_oklch_dark_a = `export const ${name} = {\n${scale_as_oklch_dark_a_properties}\n} as const;\n`;
        await fs.writeFile(path.join(out_dir, "oklch", "dark-a", `${name}.ts`), result_oklch_dark_a);
        // add to indexes
        indexes.oklch_dark_a.add(`export { ${name} as ${name.replace(/A/, "")}DarkA } from "./${name}";`);
      }
    }),
  );
  // write oklch/bw-a index.ts
  await fs.writeFile(path.join(out_dir, "oklch", "bw-a", "index.ts"), [...indexes.oklch_bw_a.values()].join("\n"));
  // write oklch/light index.ts
  await fs.writeFile(path.join(out_dir, "oklch", "light", "index.ts"), [...indexes.oklch_light.values()].join("\n"));
  // write oklch/light-a index.ts
  await fs.writeFile(
    path.join(out_dir, "oklch", "light-a", "index.ts"),
    [...indexes.oklch_light_a.values()].join("\n"),
  );
  // write oklch/dark index.ts
  await fs.writeFile(path.join(out_dir, "oklch", "dark", "index.ts"), [...indexes.oklch_dark.values()].join("\n"));
  // write oklch/dark-a index.ts
  await fs.writeFile(path.join(out_dir, "oklch", "dark-a", "index.ts"), [...indexes.oklch_dark_a.values()].join("\n"));
  // write oklch/tw-light index.ts
  await fs.writeFile(
    path.join(out_dir, "oklch", "tw-light", "index.ts"),
    [...indexes.oklch_tw_light.values()].join("\n"),
  );
  // write oklch/tw-dark index.ts
  await fs.writeFile(
    path.join(out_dir, "oklch", "tw-dark", "index.ts"),
    [...indexes.oklch_tw_dark.values()].join("\n"),
  );
  // write oklch/var-light index.ts
  await fs.writeFile(
    path.join(out_dir, "oklch", "var-light", "index.ts"),
    [...indexes.oklch_var_light.values()].join("\n"),
  );
  // write oklch/var-dark index.ts
  await fs.writeFile(
    path.join(out_dir, "oklch", "var-dark", "index.ts"),
    [...indexes.oklch_var_dark.values()].join("\n"),
  );
  // write oklch/var-tw index.ts
  await fs.writeFile(path.join(out_dir, "oklch", "var-tw", "index.ts"), [...indexes.oklch_var_tw.values()].join("\n"));
  // write oklch index.ts
  await fs.writeFile(
    path.join(out_dir, "oklch", "index.ts"),
    "export * from './bw-a';\n" +
      "export * as light from './light';\n" +
      "export * as light_a from './light-a';\n" +
      "export * as dark from './dark';\n" +
      "export * as dark_a from './dark-a';\n" +
      "export * as tw_light from './tw-light';\n" +
      "export * as tw_dark from './tw-dark';\n" +
      "export * as var_light from './var-light';\n" +
      "export * as var_dark from './var-dark';\n" +
      "export * as var_tw from './var-tw';\n",
  );
}

async function buildIndex() {
  // create tmp dir
  await mkdir(out_dir);
  await fs.writeFile(
    path.join(out_dir, "index.ts"),
    "export * as hsl from './hsl';\n" + "export * as oklch from './oklch';\n",
  );
}

async function main() {
  await buildIndex();
  await buildHSL();
  await buildOKLCH();
}

main();
