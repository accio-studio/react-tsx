import Color from "colorjs.io";

import fs from "fs/promises";
import path from "path";
import task from "tasuku";

// read from src all colors
import * as hsl_colors from "../src/hsl";

function change_case(str: string, delimiter = "-") {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join(delimiter);
}

function transform(
  scale: Record<string, string>,
  options: { color_space: "hsl" | "oklch"; mode: "func" | "var" | "var-a" },
) {
  const is_hsl = options.color_space === "hsl";
  const is_var = options.mode.includes("var");
  const is_with_alpha = options.mode.includes("-a");
  const scale_as_properties = Object.entries(scale).map(([name, value]) => {
    const color_name = name.replace(/\d+/, "-$&");
    const color = new Color(value).to(options.color_space);
    let color_value = color.toString({ precision: 5 });
    if (is_var) {
      const color_as_json = color.toJSON();
      color_value = `${color_as_json.coords
        .map(
          (x, i) =>
            ((Number.isNaN(x) ? 0 : x) * (!is_hsl && i === 0 ? 100 : 1)).toFixed(3) +
            ((is_hsl && i > 0) || (!is_hsl && i === 0) ? "%" : ""),
        )
        .join(" ")}${is_with_alpha ? ` / ${color_as_json.alpha ?? 1}` : ""}`;
    }
    return [change_case(color_name), color_value];
  });
  return Object.fromEntries(scale_as_properties) as Record<string, string>;
}

function create_css_properties(scale: Record<string, string>) {
  return Object.entries(scale)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join("\n");
}

function create_ts_properties(
  scale: Record<string, string>,
  { color_space, mode }: { color_space: "hsl" | "oklch"; mode: "var" | "var-a" },
) {
  return Object.entries(scale)
    .map(
      ([name, value]) =>
        `  /** ${new Color(`${color_space}(${value})`).toString()} */\n  "${name}": "${color_space}(var(--${name})${
          mode === "var" ? " / <alpha-value>" : ""
        })",`,
    )
    .join("\n");
}

function create_colors(
  colors: Record<string, Record<string, string>>,
  { color_space }: { color_space: "hsl" | "oklch" },
) {
  const result = {
    vars_css_light: new Map<string, string>(),
    vars_css_dark: new Map<string, string>(),
    vars_css_bw: new Map<string, string>(),
    vars_files: new Map<string, string>(),
    vars_index: new Set<string>(),
  } as const;
  Object.entries(colors).forEach(([color_scale_name, scale]) => {
    const is_a = /A$/.test(color_scale_name);
    const is_dark = /Dark$/.test(color_scale_name);
    const is_dark_a = /DarkA$/.test(color_scale_name);
    const is_bw_a = /blackA$|whiteA$/.test(color_scale_name);
    const is_light_a = !(is_dark || is_dark_a || is_bw_a) && /A$/.test(color_scale_name);
    const is_light = !(is_dark || is_dark_a || is_light_a || is_bw_a);
    const name = change_case(color_scale_name.replace(/Dark/, ""), "_") ?? "";
    const transformed = transform(scale, {
      color_space,
      mode: is_a ? "var-a" : "var",
    });
    if (is_bw_a) {
      result.vars_css_bw.set(name, create_css_properties(transformed));
      result.vars_files.set(name, create_ts_properties(transformed, { color_space, mode: "var-a" }));
      result.vars_index.add(name);
    }
    if (is_light) {
      result.vars_css_light.set(name, create_css_properties(transformed));
      result.vars_files.set(name, create_ts_properties(transformed, { color_space, mode: "var" }));
      result.vars_index.add(name);
    }
    if (is_light_a) {
      result.vars_css_light.set(name, create_css_properties(transformed));
      result.vars_files.set(name, create_ts_properties(transformed, { color_space, mode: "var-a" }));
      result.vars_index.add(name);
    }
    if (is_dark) {
      result.vars_css_dark.set(name, create_css_properties(transformed));
    }
    if (is_dark_a) {
      result.vars_css_dark.set(name, create_css_properties(transformed));
    }
  });
  return result;
}

function create_css(input: ReturnType<typeof create_colors>) {
  const { vars_css_light, vars_css_dark, vars_css_bw, vars_index } = input;
  const result = new Map<string, Set<string>>();
  for (const name of vars_index) {
    const prev = new Set(result.get(name));
    const file_name = name.replace("_", "-");
    if (vars_css_bw.has(name)) {
      const css_properties = vars_css_bw.get(name);
      result.set(file_name, prev.add(`:root {\n${css_properties}\n}`));
    }
    if (vars_css_light.has(name)) {
      const css_properties = vars_css_light.get(name);
      result.set(file_name, prev.add(`:root {\n${css_properties}\n}`));
    }
    if (vars_css_dark.has(name)) {
      const css_properties = vars_css_dark.get(name);
      result.set(file_name, prev.add(`.dark {\n${css_properties}\n}`));
    }
  }
  return Array.from(result).map(([name, value]) => [name, Array.from(value).join("\n")]);
}

function create_ts(input: ReturnType<typeof create_colors>) {
  const { vars_index, vars_files } = input;
  const files = new Map<string, string>();
  const index = new Set<string>();
  for (const name of vars_index) {
    if (vars_files.has(name)) {
      const file_name = name.replace("_", "-");
      files.set(file_name, `export const ${name} = {\n${vars_files.get(name)}\n} as const;\n`);
      index.add(`export { ${name} } from './${file_name}';`);
    }
  }
  return { files: Array.from(files), index: Array.from(index).join("\n") };
}

/**
 * @expect
 *  - css/
 *   - hsl/
 *    - vars/${color}.css
 *  - hsl/vars/${color}.ts
 */

async function main() {
  const css_path = path.join(__dirname, "../dist", "css", "oklch");
  const ts_path = path.join(__dirname, "../temp", "oklch");

  await task("Building colors", async () => {
    const create_folders = await task("Creating folders", async () => {
      await task("Creating dist folder", async () => {
        await fs.mkdir(css_path, { recursive: true });
        return "dist folder has been created";
      });
      await task("Creating temp folder", async () => {
        await fs.mkdir(ts_path, { recursive: true });
        return "temp folder has been created";
      });
    });
    create_folders.clear();

    const colors = create_colors(hsl_colors, { color_space: "oklch" });
    const css = create_css(colors);
    const write_css_files = await task.group(
      (subtask) =>
        css.map(([name, value]) => {
          return subtask(`Wrighting ${name}.css`, async () => {
            await fs.writeFile(path.join(css_path, `${name}.css`), value, { encoding: "utf-8" });
            return `${name}.css has been written`;
          });
        }),
      {
        concurrency: 8,
      },
    );
    write_css_files.clear();

    const { files, index } = create_ts(colors);
    const write_ts_files = await task.group(
      (subtask) =>
        files.map(([name, value]) => {
          return subtask(`Wrighting ${name}.ts`, async () => {
            await fs.writeFile(path.join(ts_path, `${name}.ts`), value, { encoding: "utf-8" });
            return `${name}.ts has been written`;
          });
        }),
      {
        concurrency: 8,
      },
    );
    write_ts_files.clear();
    const write_ts_index = await task("Wrighting index.ts", async () => {
      await fs.writeFile(path.join(ts_path, "index.ts"), index, { encoding: "utf-8" });
      return "index.ts has been written";
    });
    write_ts_index.clear();
    const write_index = await task("Wrighting index.ts", async () => {
      await fs.writeFile(path.join(ts_path, "../index.ts"), "export * from './oklch';\n", { encoding: "utf-8" });
      return "index.ts has been written";
    });
    write_index.clear();
  });
}

main();

// if (import.meta.vitest) {
//   const { describe, test, expect } = import.meta.vitest;

//   describe("transform oklch", () => {
//     test("transform color to variables", () => {
//       const result = transform(hsl_colors.amber, { color_space: "oklch", mode: "var" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-1": "0.994 0.003 83.058",
//           "amber-10": "0.785 0.168 66.954",
//           "amber-11": "0.551 0.138 54.067",
//           "amber-12": "0.306 0.077 44.209",
//           "amber-2": "0.984 0.017 84.586",
//           "amber-3": "0.967 0.042 90.381",
//           "amber-4": "0.946 0.065 89.008",
//           "amber-5": "0.924 0.088 87.388",
//           "amber-6": "0.888 0.107 80.372",
//           "amber-7": "0.823 0.124 75.674",
//           "amber-8": "0.759 0.152 69.344",
//           "amber-9": "0.817 0.164 75.994",
//         }
//       `);
//     });
//     test("transform dark color to variables", () => {
//       const result = transform(hsl_colors.amberDark, { color_space: "oklch", mode: "var" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-1": "0.197 0.041 78.894",
//           "amber-10": "0.866 0.154 86.431",
//           "amber-11": "0.770 0.162 73.182",
//           "amber-12": "0.967 0.031 83.049",
//           "amber-2": "0.219 0.046 74.668",
//           "amber-3": "0.253 0.056 66.117",
//           "amber-4": "0.284 0.064 64.175",
//           "amber-5": "0.317 0.071 64.615",
//           "amber-6": "0.357 0.079 67.295",
//           "amber-7": "0.410 0.088 67.243",
//           "amber-8": "0.473 0.105 67.005",
//           "amber-9": "0.817 0.164 75.994",
//         }
//       `);
//     });
//     test("transform color with alpha to variables", () => {
//       const result = transform(hsl_colors.amberA, { color_space: "oklch", mode: "var-a" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-a-1": "0.654 0.137 74.868 / 0.016",
//           "amber-a-10": "0.765 0.175 62.451 / 0.891",
//           "amber-a-11": "0.542 0.139 52.369 / 0.98",
//           "amber-a-12": "0.281 0.081 44.415 / 0.965",
//           "amber-a-2": "0.803 0.170 73.486 / 0.071",
//           "amber-a-3": "0.833 0.172 82.115 / 0.165",
//           "amber-a-4": "0.825 0.171 79.884 / 0.263",
//           "amber-a-5": "0.817 0.170 77.689 / 0.365",
//           "amber-a-6": "0.787 0.172 68.942 / 0.475",
//           "amber-a-7": "0.728 0.164 64.791 / 0.612",
//           "amber-a-8": "0.718 0.164 62.730 / 0.832",
//           "amber-a-9": "0.794 0.171 71.058 / 0.859",
//         }
//       `);
//     });
//     test("transform dark color with alpha to variables", () => {
//       const result = transform(hsl_colors.amberDarkA, { color_space: "oklch", mode: "var-a" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-a-1": "0.000 0.000 0.000 / 0",
//           "amber-a-10": "0.872 0.155 88.189 / 0.98",
//           "amber-a-11": "0.803 0.169 73.148 / 0.938",
//           "amber-a-12": "0.978 0.030 91.648 / 0.98",
//           "amber-a-2": "0.734 0.183 54.600 / 0.036",
//           "amber-a-3": "0.712 0.194 47.798 / 0.094",
//           "amber-a-4": "0.725 0.189 51.040 / 0.143",
//           "amber-a-5": "0.738 0.184 54.583 / 0.192",
//           "amber-a-6": "0.765 0.175 62.451 / 0.25",
//           "amber-a-7": "0.768 0.172 62.991 / 0.331",
//           "amber-a-8": "0.772 0.174 64.552 / 0.442",
//           "amber-a-9": "0.825 0.164 78.098 / 0.98",
//         }
//       `);
//     });
//     test("transform black with alpha to variables", () => {
//       const result = transform(hsl_colors.blackA, { color_space: "oklch", mode: "var-a" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "black-a-1": "0.000 0.000 0.000 / 0.012",
//           "black-a-10": "0.000 0.000 0.000 / 0.478",
//           "black-a-11": "0.000 0.000 0.000 / 0.565",
//           "black-a-12": "0.000 0.000 0.000 / 0.91",
//           "black-a-2": "0.000 0.000 0.000 / 0.027",
//           "black-a-3": "0.000 0.000 0.000 / 0.047",
//           "black-a-4": "0.000 0.000 0.000 / 0.071",
//           "black-a-5": "0.000 0.000 0.000 / 0.09",
//           "black-a-6": "0.000 0.000 0.000 / 0.114",
//           "black-a-7": "0.000 0.000 0.000 / 0.141",
//           "black-a-8": "0.000 0.000 0.000 / 0.22",
//           "black-a-9": "0.000 0.000 0.000 / 0.439",
//         }
//       `);
//     });
//     test("transform color to css color functions", () => {
//       const result = transform(hsl_colors.amber, { color_space: "oklch", mode: "func" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-1": "oklch(0.9943 0.0033 83.058)",
//           "amber-10": "oklch(0.7853 0.1677 66.954)",
//           "amber-11": "oklch(0.551 0.138 54.067)",
//           "amber-12": "oklch(0.3062 0.0773 44.209)",
//           "amber-2": "oklch(0.9836 0.0169 84.586)",
//           "amber-3": "oklch(0.9672 0.0422 90.381)",
//           "amber-4": "oklch(0.9464 0.0655 89.008)",
//           "amber-5": "oklch(0.9244 0.0877 87.388)",
//           "amber-6": "oklch(0.8875 0.1067 80.372)",
//           "amber-7": "oklch(0.8234 0.1236 75.674)",
//           "amber-8": "oklch(0.7593 0.1524 69.344)",
//           "amber-9": "oklch(0.8173 0.164 75.994)",
//         }
//       `);
//     });
//     test("transform color with alpha to css color functions", () => {
//       const result = transform(hsl_colors.amberA, { color_space: "oklch", mode: "func" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-a-1": "oklch(0.6537 0.1369 74.868 / 0.016)",
//           "amber-a-10": "oklch(0.7648 0.1753 62.451 / 0.891)",
//           "amber-a-11": "oklch(0.5417 0.1386 52.369 / 0.98)",
//           "amber-a-12": "oklch(0.2807 0.0809 44.415 / 0.965)",
//           "amber-a-2": "oklch(0.8025 0.1703 73.486 / 0.071)",
//           "amber-a-3": "oklch(0.833 0.1715 82.115 / 0.165)",
//           "amber-a-4": "oklch(0.8248 0.1709 79.884 / 0.263)",
//           "amber-a-5": "oklch(0.817 0.1705 77.689 / 0.365)",
//           "amber-a-6": "oklch(0.7869 0.1715 68.942 / 0.475)",
//           "amber-a-7": "oklch(0.7276 0.1635 64.791 / 0.612)",
//           "amber-a-8": "oklch(0.7185 0.1642 62.73 / 0.832)",
//           "amber-a-9": "oklch(0.794 0.1709 71.058 / 0.859)",
//         }
//       `);
//     });
//     test("transform black with alpha to css color functions", () => {
//       const result = transform(hsl_colors.blackA, { color_space: "oklch", mode: "func" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "black-a-1": "oklch(0 0 0 / 0.012)",
//           "black-a-10": "oklch(0 0 0 / 0.478)",
//           "black-a-11": "oklch(0 0 0 / 0.565)",
//           "black-a-12": "oklch(0 0 0 / 0.91)",
//           "black-a-2": "oklch(0 0 0 / 0.027)",
//           "black-a-3": "oklch(0 0 0 / 0.047)",
//           "black-a-4": "oklch(0 0 0 / 0.071)",
//           "black-a-5": "oklch(0 0 0 / 0.09)",
//           "black-a-6": "oklch(0 0 0 / 0.114)",
//           "black-a-7": "oklch(0 0 0 / 0.141)",
//           "black-a-8": "oklch(0 0 0 / 0.22)",
//           "black-a-9": "oklch(0 0 0 / 0.439)",
//         }
//       `);
//     });
//   });

//   describe("transform hsl", () => {
//     test("transform color to variables", () => {
//       const result = transform(hsl_colors.amber, { color_space: "hsl", mode: "var" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-1": "39.000 70.000% 99.000%",
//           "amber-10": "35.000 100.000% 55.500%",
//           "amber-11": "30.000 100.000% 34.000%",
//           "amber-12": "20.000 80.000% 17.000%",
//           "amber-2": "40.000 100.000% 96.500%",
//           "amber-3": "44.000 100.000% 91.700%",
//           "amber-4": "43.000 100.000% 86.800%",
//           "amber-5": "42.000 100.000% 81.800%",
//           "amber-6": "38.000 99.700% 76.300%",
//           "amber-7": "36.000 86.100% 67.100%",
//           "amber-8": "35.000 85.200% 55.100%",
//           "amber-9": "39.000 100.000% 57.000%",
//         }
//       `);
//     });
//     test("transform dark color to variables", () => {
//       const result = transform(hsl_colors.amberDark, { color_space: "hsl", mode: "var" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-1": "36.000 100.000% 6.100%",
//           "amber-10": "43.000 100.000% 64.000%",
//           "amber-11": "39.000 90.000% 49.800%",
//           "amber-12": "39.000 97.000% 93.200%",
//           "amber-2": "35.000 100.000% 7.600%",
//           "amber-3": "32.000 100.000% 10.200%",
//           "amber-4": "32.000 100.000% 12.400%",
//           "amber-5": "33.000 100.000% 14.600%",
//           "amber-6": "35.000 100.000% 17.100%",
//           "amber-7": "35.000 91.000% 21.600%",
//           "amber-8": "36.000 100.000% 25.500%",
//           "amber-9": "39.000 100.000% 57.000%",
//         }
//       `);
//     });
//     test("transform color with alpha to variables", () => {
//       const result = transform(hsl_colors.amberA, { color_space: "hsl", mode: "var-a" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-a-1": "40.000 94.900% 38.700% / 0.016",
//           "amber-a-10": "35.000 100.000% 50.000% / 0.891",
//           "amber-a-11": "29.000 100.000% 33.600% / 0.98",
//           "amber-a-12": "20.000 99.800% 14.100% / 0.965",
//           "amber-a-2": "40.000 100.000% 50.300% / 0.071",
//           "amber-a-3": "44.000 100.000% 50.100% / 0.165",
//           "amber-a-4": "43.000 100.000% 50.000% / 0.263",
//           "amber-a-5": "42.000 100.000% 50.000% / 0.365",
//           "amber-a-6": "38.000 100.000% 50.100% / 0.475",
//           "amber-a-7": "36.000 99.900% 46.200% / 0.612",
//           "amber-a-8": "35.000 99.800% 46.000% / 0.832",
//           "amber-a-9": "39.000 100.000% 50.000% / 0.859",
//         }
//       `);
//     });
//     test("transform dark color with alpha to variables", () => {
//       const result = transform(hsl_colors.amberDarkA, { color_space: "hsl", mode: "var-a" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-a-1": "0.000 0.000% 0.000% / 0",
//           "amber-a-10": "44.000 100.000% 64.200% / 0.98",
//           "amber-a-11": "39.000 99.900% 52.700% / 0.938",
//           "amber-a-12": "45.000 100.000% 94.200% / 0.98",
//           "amber-a-2": "31.000 100.000% 49.700% / 0.036",
//           "amber-a-3": "27.000 100.000% 49.900% / 0.094",
//           "amber-a-4": "29.000 100.000% 50.000% / 0.143",
//           "amber-a-5": "31.000 100.000% 50.000% / 0.192",
//           "amber-a-6": "35.000 100.000% 50.000% / 0.25",
//           "amber-a-7": "34.000 99.600% 52.900% / 0.331",
//           "amber-a-8": "36.000 100.000% 50.000% / 0.442",
//           "amber-a-9": "40.000 100.000% 57.200% / 0.98",
//         }
//       `);
//     });
//     test("transform black with alpha to variables", () => {
//       const result = transform(hsl_colors.blackA, { color_space: "hsl", mode: "var-a" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "black-a-1": "0.000 0.000% 0.000% / 0.012",
//           "black-a-10": "0.000 0.000% 0.000% / 0.478",
//           "black-a-11": "0.000 0.000% 0.000% / 0.565",
//           "black-a-12": "0.000 0.000% 0.000% / 0.91",
//           "black-a-2": "0.000 0.000% 0.000% / 0.027",
//           "black-a-3": "0.000 0.000% 0.000% / 0.047",
//           "black-a-4": "0.000 0.000% 0.000% / 0.071",
//           "black-a-5": "0.000 0.000% 0.000% / 0.09",
//           "black-a-6": "0.000 0.000% 0.000% / 0.114",
//           "black-a-7": "0.000 0.000% 0.000% / 0.141",
//           "black-a-8": "0.000 0.000% 0.000% / 0.22",
//           "black-a-9": "0.000 0.000% 0.000% / 0.439",
//         }
//       `);
//     });
//     test("transform color to css color functions", () => {
//       const result = transform(hsl_colors.amber, { color_space: "hsl", mode: "func" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-1": "hsl(39 70% 99%)",
//           "amber-10": "hsl(35 100% 55.5%)",
//           "amber-11": "hsl(30 100% 34%)",
//           "amber-12": "hsl(20 80% 17%)",
//           "amber-2": "hsl(40 100% 96.5%)",
//           "amber-3": "hsl(44 100% 91.7%)",
//           "amber-4": "hsl(43 100% 86.8%)",
//           "amber-5": "hsl(42 100% 81.8%)",
//           "amber-6": "hsl(38 99.7% 76.3%)",
//           "amber-7": "hsl(36 86.1% 67.1%)",
//           "amber-8": "hsl(35 85.2% 55.1%)",
//           "amber-9": "hsl(39 100% 57%)",
//         }
//       `);
//     });
//     test("transform color with alpha to css color functions", () => {
//       const result = transform(hsl_colors.amberA, { color_space: "hsl", mode: "func" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "amber-a-1": "hsl(40 94.9% 38.7% / 0.016)",
//           "amber-a-10": "hsl(35 100% 50% / 0.891)",
//           "amber-a-11": "hsl(29 100% 33.6% / 0.98)",
//           "amber-a-12": "hsl(20 99.8% 14.1% / 0.965)",
//           "amber-a-2": "hsl(40 100% 50.3% / 0.071)",
//           "amber-a-3": "hsl(44 100% 50.1% / 0.165)",
//           "amber-a-4": "hsl(43 100% 50% / 0.263)",
//           "amber-a-5": "hsl(42 100% 50% / 0.365)",
//           "amber-a-6": "hsl(38 100% 50.1% / 0.475)",
//           "amber-a-7": "hsl(36 99.9% 46.2% / 0.612)",
//           "amber-a-8": "hsl(35 99.8% 46% / 0.832)",
//           "amber-a-9": "hsl(39 100% 50% / 0.859)",
//         }
//       `);
//     });
//     test("transform black with alpha to css color functions", () => {
//       const result = transform(hsl_colors.blackA, { color_space: "hsl", mode: "func" });
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "black-a-1": "hsl(0 0% 0% / 0.012)",
//           "black-a-10": "hsl(0 0% 0% / 0.478)",
//           "black-a-11": "hsl(0 0% 0% / 0.565)",
//           "black-a-12": "hsl(0 0% 0% / 0.91)",
//           "black-a-2": "hsl(0 0% 0% / 0.027)",
//           "black-a-3": "hsl(0 0% 0% / 0.047)",
//           "black-a-4": "hsl(0 0% 0% / 0.071)",
//           "black-a-5": "hsl(0 0% 0% / 0.09)",
//           "black-a-6": "hsl(0 0% 0% / 0.114)",
//           "black-a-7": "hsl(0 0% 0% / 0.141)",
//           "black-a-8": "hsl(0 0% 0% / 0.22)",
//           "black-a-9": "hsl(0 0% 0% / 0.439)",
//         }
//       `);
//     });
//   });

//   describe("create colors in oklch", () => {
//     test("create colors in oklch", () => {
//       const result = create_colors(
//         {
//           amber: hsl_colors.amber,
//           amberA: hsl_colors.amberA,
//           amberDark: hsl_colors.amberDark,
//           amberDarkA: hsl_colors.amberDarkA,
//           blackA: hsl_colors.blackA,
//         },
//         { color_space: "oklch" },
//       );
//       expect(result).toMatchInlineSnapshot(`
//         {
//           "vars_css_bw": Map {
//             "black_a" => "  --black-a-1: 0.000 0.000 0.000 / 0.012;
//           --black-a-2: 0.000 0.000 0.000 / 0.027;
//           --black-a-3: 0.000 0.000 0.000 / 0.047;
//           --black-a-4: 0.000 0.000 0.000 / 0.071;
//           --black-a-5: 0.000 0.000 0.000 / 0.09;
//           --black-a-6: 0.000 0.000 0.000 / 0.114;
//           --black-a-7: 0.000 0.000 0.000 / 0.141;
//           --black-a-8: 0.000 0.000 0.000 / 0.22;
//           --black-a-9: 0.000 0.000 0.000 / 0.439;
//           --black-a-10: 0.000 0.000 0.000 / 0.478;
//           --black-a-11: 0.000 0.000 0.000 / 0.565;
//           --black-a-12: 0.000 0.000 0.000 / 0.91;",
//           },
//           "vars_css_dark": Map {
//             "amber" => "  --amber-1: 0.197 0.041 78.894;
//           --amber-2: 0.219 0.046 74.668;
//           --amber-3: 0.253 0.056 66.117;
//           --amber-4: 0.284 0.064 64.175;
//           --amber-5: 0.317 0.071 64.615;
//           --amber-6: 0.357 0.079 67.295;
//           --amber-7: 0.410 0.088 67.243;
//           --amber-8: 0.473 0.105 67.005;
//           --amber-9: 0.817 0.164 75.994;
//           --amber-10: 0.866 0.154 86.431;
//           --amber-11: 0.770 0.162 73.182;
//           --amber-12: 0.967 0.031 83.049;",
//             "amber_a" => "  --amber-a-1: 0.000 0.000 0.000 / 0;
//           --amber-a-2: 0.734 0.183 54.600 / 0.036;
//           --amber-a-3: 0.712 0.194 47.798 / 0.094;
//           --amber-a-4: 0.725 0.189 51.040 / 0.143;
//           --amber-a-5: 0.738 0.184 54.583 / 0.192;
//           --amber-a-6: 0.765 0.175 62.451 / 0.25;
//           --amber-a-7: 0.768 0.172 62.991 / 0.331;
//           --amber-a-8: 0.772 0.174 64.552 / 0.442;
//           --amber-a-9: 0.825 0.164 78.098 / 0.98;
//           --amber-a-10: 0.872 0.155 88.189 / 0.98;
//           --amber-a-11: 0.803 0.169 73.148 / 0.938;
//           --amber-a-12: 0.978 0.030 91.648 / 0.98;",
//           },
//           "vars_css_light": Map {
//             "amber" => "  --amber-1: 0.994 0.003 83.058;
//           --amber-2: 0.984 0.017 84.586;
//           --amber-3: 0.967 0.042 90.381;
//           --amber-4: 0.946 0.065 89.008;
//           --amber-5: 0.924 0.088 87.388;
//           --amber-6: 0.888 0.107 80.372;
//           --amber-7: 0.823 0.124 75.674;
//           --amber-8: 0.759 0.152 69.344;
//           --amber-9: 0.817 0.164 75.994;
//           --amber-10: 0.785 0.168 66.954;
//           --amber-11: 0.551 0.138 54.067;
//           --amber-12: 0.306 0.077 44.209;",
//             "amber_a" => "  --amber-a-1: 0.654 0.137 74.868 / 0.016;
//           --amber-a-2: 0.803 0.170 73.486 / 0.071;
//           --amber-a-3: 0.833 0.172 82.115 / 0.165;
//           --amber-a-4: 0.825 0.171 79.884 / 0.263;
//           --amber-a-5: 0.817 0.170 77.689 / 0.365;
//           --amber-a-6: 0.787 0.172 68.942 / 0.475;
//           --amber-a-7: 0.728 0.164 64.791 / 0.612;
//           --amber-a-8: 0.718 0.164 62.730 / 0.832;
//           --amber-a-9: 0.794 0.171 71.058 / 0.859;
//           --amber-a-10: 0.765 0.175 62.451 / 0.891;
//           --amber-a-11: 0.542 0.139 52.369 / 0.98;
//           --amber-a-12: 0.281 0.081 44.415 / 0.965;",
//           },
//           "vars_files": Map {
//             "amber" => "  /** oklch(0.994 0.003 83.058) */
//           amber-1: 'oklch(var(--amber-1) / <alpha-value>)',
//           /** oklch(0.984 0.017 84.586) */
//           amber-2: 'oklch(var(--amber-2) / <alpha-value>)',
//           /** oklch(0.967 0.042 90.381) */
//           amber-3: 'oklch(var(--amber-3) / <alpha-value>)',
//           /** oklch(0.946 0.065 89.008) */
//           amber-4: 'oklch(var(--amber-4) / <alpha-value>)',
//           /** oklch(0.924 0.088 87.388) */
//           amber-5: 'oklch(var(--amber-5) / <alpha-value>)',
//           /** oklch(0.888 0.107 80.372) */
//           amber-6: 'oklch(var(--amber-6) / <alpha-value>)',
//           /** oklch(0.823 0.124 75.674) */
//           amber-7: 'oklch(var(--amber-7) / <alpha-value>)',
//           /** oklch(0.759 0.152 69.344) */
//           amber-8: 'oklch(var(--amber-8) / <alpha-value>)',
//           /** oklch(0.817 0.164 75.994) */
//           amber-9: 'oklch(var(--amber-9) / <alpha-value>)',
//           /** oklch(0.785 0.168 66.954) */
//           amber-10: 'oklch(var(--amber-10) / <alpha-value>)',
//           /** oklch(0.551 0.138 54.067) */
//           amber-11: 'oklch(var(--amber-11) / <alpha-value>)',
//           /** oklch(0.306 0.077 44.209) */
//           amber-12: 'oklch(var(--amber-12) / <alpha-value>)',",
//             "amber_a" => "  /** oklch(0.654 0.137 74.868 / 0.016) */
//           amber-a-1: 'oklch(var(--amber-a-1))',
//           /** oklch(0.803 0.17 73.486 / 0.071) */
//           amber-a-2: 'oklch(var(--amber-a-2))',
//           /** oklch(0.833 0.172 82.115 / 0.165) */
//           amber-a-3: 'oklch(var(--amber-a-3))',
//           /** oklch(0.825 0.171 79.884 / 0.263) */
//           amber-a-4: 'oklch(var(--amber-a-4))',
//           /** oklch(0.817 0.17 77.689 / 0.365) */
//           amber-a-5: 'oklch(var(--amber-a-5))',
//           /** oklch(0.787 0.172 68.942 / 0.475) */
//           amber-a-6: 'oklch(var(--amber-a-6))',
//           /** oklch(0.728 0.164 64.791 / 0.612) */
//           amber-a-7: 'oklch(var(--amber-a-7))',
//           /** oklch(0.718 0.164 62.73 / 0.832) */
//           amber-a-8: 'oklch(var(--amber-a-8))',
//           /** oklch(0.794 0.171 71.058 / 0.859) */
//           amber-a-9: 'oklch(var(--amber-a-9))',
//           /** oklch(0.765 0.175 62.451 / 0.891) */
//           amber-a-10: 'oklch(var(--amber-a-10))',
//           /** oklch(0.542 0.139 52.369 / 0.98) */
//           amber-a-11: 'oklch(var(--amber-a-11))',
//           /** oklch(0.281 0.081 44.415 / 0.965) */
//           amber-a-12: 'oklch(var(--amber-a-12))',",
//             "black_a" => "  /** oklch(0 0 0 / 0.012) */
//           black-a-1: 'oklch(var(--black-a-1))',
//           /** oklch(0 0 0 / 0.027) */
//           black-a-2: 'oklch(var(--black-a-2))',
//           /** oklch(0 0 0 / 0.047) */
//           black-a-3: 'oklch(var(--black-a-3))',
//           /** oklch(0 0 0 / 0.071) */
//           black-a-4: 'oklch(var(--black-a-4))',
//           /** oklch(0 0 0 / 0.09) */
//           black-a-5: 'oklch(var(--black-a-5))',
//           /** oklch(0 0 0 / 0.114) */
//           black-a-6: 'oklch(var(--black-a-6))',
//           /** oklch(0 0 0 / 0.141) */
//           black-a-7: 'oklch(var(--black-a-7))',
//           /** oklch(0 0 0 / 0.22) */
//           black-a-8: 'oklch(var(--black-a-8))',
//           /** oklch(0 0 0 / 0.439) */
//           black-a-9: 'oklch(var(--black-a-9))',
//           /** oklch(0 0 0 / 0.478) */
//           black-a-10: 'oklch(var(--black-a-10))',
//           /** oklch(0 0 0 / 0.565) */
//           black-a-11: 'oklch(var(--black-a-11))',
//           /** oklch(0 0 0 / 0.91) */
//           black-a-12: 'oklch(var(--black-a-12))',",
//           },
//           "vars_index": Set {
//             "amber",
//             "amber_a",
//             "black_a",
//           },
//         }
//       `);
//     });
//     test("generate correct css", () => {
//       const result = create_colors(
//         {
//           amber: hsl_colors.amber,
//           amberA: hsl_colors.amberA,
//           amberDark: hsl_colors.amberDark,
//           amberDarkA: hsl_colors.amberDarkA,
//           blackA: hsl_colors.blackA,
//         },
//         { color_space: "oklch" },
//       );
//       const css = create_css(result);
//       expect(css).toMatchInlineSnapshot(`
//         [
//           [
//             "amber",
//             ":root {
//           --amber-1: 0.994 0.003 83.058;
//           --amber-2: 0.984 0.017 84.586;
//           --amber-3: 0.967 0.042 90.381;
//           --amber-4: 0.946 0.065 89.008;
//           --amber-5: 0.924 0.088 87.388;
//           --amber-6: 0.888 0.107 80.372;
//           --amber-7: 0.823 0.124 75.674;
//           --amber-8: 0.759 0.152 69.344;
//           --amber-9: 0.817 0.164 75.994;
//           --amber-10: 0.785 0.168 66.954;
//           --amber-11: 0.551 0.138 54.067;
//           --amber-12: 0.306 0.077 44.209;
//         }
//         .dark {
//           --amber-1: 0.994 0.003 83.058;
//           --amber-2: 0.984 0.017 84.586;
//           --amber-3: 0.967 0.042 90.381;
//           --amber-4: 0.946 0.065 89.008;
//           --amber-5: 0.924 0.088 87.388;
//           --amber-6: 0.888 0.107 80.372;
//           --amber-7: 0.823 0.124 75.674;
//           --amber-8: 0.759 0.152 69.344;
//           --amber-9: 0.817 0.164 75.994;
//           --amber-10: 0.785 0.168 66.954;
//           --amber-11: 0.551 0.138 54.067;
//           --amber-12: 0.306 0.077 44.209;
//         }",
//           ],
//           [
//             "amber-a",
//             ":root {
//           --amber-a-1: 0.654 0.137 74.868 / 0.016;
//           --amber-a-2: 0.803 0.170 73.486 / 0.071;
//           --amber-a-3: 0.833 0.172 82.115 / 0.165;
//           --amber-a-4: 0.825 0.171 79.884 / 0.263;
//           --amber-a-5: 0.817 0.170 77.689 / 0.365;
//           --amber-a-6: 0.787 0.172 68.942 / 0.475;
//           --amber-a-7: 0.728 0.164 64.791 / 0.612;
//           --amber-a-8: 0.718 0.164 62.730 / 0.832;
//           --amber-a-9: 0.794 0.171 71.058 / 0.859;
//           --amber-a-10: 0.765 0.175 62.451 / 0.891;
//           --amber-a-11: 0.542 0.139 52.369 / 0.98;
//           --amber-a-12: 0.281 0.081 44.415 / 0.965;
//         }
//         .dark {
//           --amber-a-1: 0.654 0.137 74.868 / 0.016;
//           --amber-a-2: 0.803 0.170 73.486 / 0.071;
//           --amber-a-3: 0.833 0.172 82.115 / 0.165;
//           --amber-a-4: 0.825 0.171 79.884 / 0.263;
//           --amber-a-5: 0.817 0.170 77.689 / 0.365;
//           --amber-a-6: 0.787 0.172 68.942 / 0.475;
//           --amber-a-7: 0.728 0.164 64.791 / 0.612;
//           --amber-a-8: 0.718 0.164 62.730 / 0.832;
//           --amber-a-9: 0.794 0.171 71.058 / 0.859;
//           --amber-a-10: 0.765 0.175 62.451 / 0.891;
//           --amber-a-11: 0.542 0.139 52.369 / 0.98;
//           --amber-a-12: 0.281 0.081 44.415 / 0.965;
//         }",
//           ],
//           [
//             "black-a",
//             ":root {
//           --black-a-1: 0.000 0.000 0.000 / 0.012;
//           --black-a-2: 0.000 0.000 0.000 / 0.027;
//           --black-a-3: 0.000 0.000 0.000 / 0.047;
//           --black-a-4: 0.000 0.000 0.000 / 0.071;
//           --black-a-5: 0.000 0.000 0.000 / 0.09;
//           --black-a-6: 0.000 0.000 0.000 / 0.114;
//           --black-a-7: 0.000 0.000 0.000 / 0.141;
//           --black-a-8: 0.000 0.000 0.000 / 0.22;
//           --black-a-9: 0.000 0.000 0.000 / 0.439;
//           --black-a-10: 0.000 0.000 0.000 / 0.478;
//           --black-a-11: 0.000 0.000 0.000 / 0.565;
//           --black-a-12: 0.000 0.000 0.000 / 0.91;
//         }",
//           ],
//         ]
//       `);
//     });
//     test("generate correct ts", () => {
//       const result = create_colors(
//         {
//           amber: hsl_colors.amber,
//           amberA: hsl_colors.amberA,
//           amberDark: hsl_colors.amberDark,
//           amberDarkA: hsl_colors.amberDarkA,
//           blackA: hsl_colors.blackA,
//         },
//         { color_space: "oklch" },
//       );
//       const css = create_ts(result);
//       expect(css).toMatchInlineSnapshot(`
//         {
//           "files": [
//             [
//               "amber",
//               "export const amber = {
//           /** oklch(0.994 0.003 83.058) */
//           amber-1: 'oklch(var(--amber-1) / <alpha-value>)',
//           /** oklch(0.984 0.017 84.586) */
//           amber-2: 'oklch(var(--amber-2) / <alpha-value>)',
//           /** oklch(0.967 0.042 90.381) */
//           amber-3: 'oklch(var(--amber-3) / <alpha-value>)',
//           /** oklch(0.946 0.065 89.008) */
//           amber-4: 'oklch(var(--amber-4) / <alpha-value>)',
//           /** oklch(0.924 0.088 87.388) */
//           amber-5: 'oklch(var(--amber-5) / <alpha-value>)',
//           /** oklch(0.888 0.107 80.372) */
//           amber-6: 'oklch(var(--amber-6) / <alpha-value>)',
//           /** oklch(0.823 0.124 75.674) */
//           amber-7: 'oklch(var(--amber-7) / <alpha-value>)',
//           /** oklch(0.759 0.152 69.344) */
//           amber-8: 'oklch(var(--amber-8) / <alpha-value>)',
//           /** oklch(0.817 0.164 75.994) */
//           amber-9: 'oklch(var(--amber-9) / <alpha-value>)',
//           /** oklch(0.785 0.168 66.954) */
//           amber-10: 'oklch(var(--amber-10) / <alpha-value>)',
//           /** oklch(0.551 0.138 54.067) */
//           amber-11: 'oklch(var(--amber-11) / <alpha-value>)',
//           /** oklch(0.306 0.077 44.209) */
//           amber-12: 'oklch(var(--amber-12) / <alpha-value>)',
//         } as const;
//         ",
//             ],
//             [
//               "amber-a",
//               "export const amber_a = {
//           /** oklch(0.654 0.137 74.868 / 0.016) */
//           amber-a-1: 'oklch(var(--amber-a-1))',
//           /** oklch(0.803 0.17 73.486 / 0.071) */
//           amber-a-2: 'oklch(var(--amber-a-2))',
//           /** oklch(0.833 0.172 82.115 / 0.165) */
//           amber-a-3: 'oklch(var(--amber-a-3))',
//           /** oklch(0.825 0.171 79.884 / 0.263) */
//           amber-a-4: 'oklch(var(--amber-a-4))',
//           /** oklch(0.817 0.17 77.689 / 0.365) */
//           amber-a-5: 'oklch(var(--amber-a-5))',
//           /** oklch(0.787 0.172 68.942 / 0.475) */
//           amber-a-6: 'oklch(var(--amber-a-6))',
//           /** oklch(0.728 0.164 64.791 / 0.612) */
//           amber-a-7: 'oklch(var(--amber-a-7))',
//           /** oklch(0.718 0.164 62.73 / 0.832) */
//           amber-a-8: 'oklch(var(--amber-a-8))',
//           /** oklch(0.794 0.171 71.058 / 0.859) */
//           amber-a-9: 'oklch(var(--amber-a-9))',
//           /** oklch(0.765 0.175 62.451 / 0.891) */
//           amber-a-10: 'oklch(var(--amber-a-10))',
//           /** oklch(0.542 0.139 52.369 / 0.98) */
//           amber-a-11: 'oklch(var(--amber-a-11))',
//           /** oklch(0.281 0.081 44.415 / 0.965) */
//           amber-a-12: 'oklch(var(--amber-a-12))',
//         } as const;
//         ",
//             ],
//             [
//               "black-a",
//               "export const black_a = {
//           /** oklch(0 0 0 / 0.012) */
//           black-a-1: 'oklch(var(--black-a-1))',
//           /** oklch(0 0 0 / 0.027) */
//           black-a-2: 'oklch(var(--black-a-2))',
//           /** oklch(0 0 0 / 0.047) */
//           black-a-3: 'oklch(var(--black-a-3))',
//           /** oklch(0 0 0 / 0.071) */
//           black-a-4: 'oklch(var(--black-a-4))',
//           /** oklch(0 0 0 / 0.09) */
//           black-a-5: 'oklch(var(--black-a-5))',
//           /** oklch(0 0 0 / 0.114) */
//           black-a-6: 'oklch(var(--black-a-6))',
//           /** oklch(0 0 0 / 0.141) */
//           black-a-7: 'oklch(var(--black-a-7))',
//           /** oklch(0 0 0 / 0.22) */
//           black-a-8: 'oklch(var(--black-a-8))',
//           /** oklch(0 0 0 / 0.439) */
//           black-a-9: 'oklch(var(--black-a-9))',
//           /** oklch(0 0 0 / 0.478) */
//           black-a-10: 'oklch(var(--black-a-10))',
//           /** oklch(0 0 0 / 0.565) */
//           black-a-11: 'oklch(var(--black-a-11))',
//           /** oklch(0 0 0 / 0.91) */
//           black-a-12: 'oklch(var(--black-a-12))',
//         } as const;
//         ",
//             ],
//           ],
//           "index": "export { amber } from './amber';
//         export { amber_a } from './amber-a';
//         export { black_a } from './black-a';",
//         }
//       `);
//     });
//   });
// }
