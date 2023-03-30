import Color from "colorjs.io";

// import fs from "fs/promises";
// import task from "tasuku";

// const api = await task.group(
//   (task) => [
//     task("Task 1", () => await someAsyncTask()),

//     task("Task 2", async () => await someAsyncTask()),

//     // ...
//   ],
//   {
//     concurrency: 2, // Number of tasks to run at a time
//   },
// );

// api.clear(); // Clear output

// read from src all colors
import * as hsl_colors from "../src/hsl";

function to_kebab_case(str: string) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join("-");
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
        .map((x, i) => (Number.isNaN(x) ? 0 : x).toPrecision(5) + (is_hsl && i > 0 ? "%" : ""))
        .join(" ")}${is_with_alpha ? ` / ${color_as_json.alpha ?? 1}` : ""}`;
    }
    return [to_kebab_case(color_name), color_value];
  });
  return Object.fromEntries(scale_as_properties);
}

if (import.meta.vitest) {
  const { describe, test, expect } = import.meta.vitest;

  describe("transform oklch", () => {
    test("transform color to variables", () => {
      const result = transform(hsl_colors.amber, { color_space: "oklch", mode: "var" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-1": "0.99431 0.0033429 83.058",
          "amber-10": "0.78529 0.16767 66.954",
          "amber-11": "0.55102 0.13799 54.067",
          "amber-12": "0.30617 0.077346 44.209",
          "amber-2": "0.98364 0.016916 84.586",
          "amber-3": "0.96718 0.042234 90.381",
          "amber-4": "0.94644 0.065473 89.008",
          "amber-5": "0.92436 0.087664 87.388",
          "amber-6": "0.88753 0.10674 80.372",
          "amber-7": "0.82335 0.12358 75.674",
          "amber-8": "0.75925 0.15245 69.344",
          "amber-9": "0.81733 0.16400 75.994",
        }
      `);
    });
    test("transform dark color to variables", () => {
      const result = transform(hsl_colors.amberDark, { color_space: "oklch", mode: "var" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-1": "0.19691 0.040922 78.894",
          "amber-10": "0.86587 0.15367 86.431",
          "amber-11": "0.77011 0.16187 73.182",
          "amber-12": "0.96676 0.031394 83.049",
          "amber-2": "0.21915 0.046301 74.668",
          "amber-3": "0.25270 0.056209 66.117",
          "amber-4": "0.28407 0.064159 64.175",
          "amber-5": "0.31723 0.071392 64.615",
          "amber-6": "0.35745 0.078829 67.295",
          "amber-7": "0.40980 0.087595 67.243",
          "amber-8": "0.47345 0.10463 67.005",
          "amber-9": "0.81733 0.16400 75.994",
        }
      `);
    });
    test("transform color with alpha to variables", () => {
      const result = transform(hsl_colors.amberA, { color_space: "oklch", mode: "var-a" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-a-1": "0.65372 0.13691 74.868 / 0.016",
          "amber-a-10": "0.76482 0.17530 62.451 / 0.891",
          "amber-a-11": "0.54169 0.13862 52.369 / 0.98",
          "amber-a-12": "0.28065 0.080934 44.415 / 0.965",
          "amber-a-2": "0.80251 0.17029 73.486 / 0.071",
          "amber-a-3": "0.83302 0.17154 82.115 / 0.165",
          "amber-a-4": "0.82483 0.17090 79.884 / 0.263",
          "amber-a-5": "0.81699 0.17049 77.689 / 0.365",
          "amber-a-6": "0.78688 0.17153 68.942 / 0.475",
          "amber-a-7": "0.72764 0.16350 64.791 / 0.612",
          "amber-a-8": "0.71845 0.16422 62.730 / 0.832",
          "amber-a-9": "0.79401 0.17092 71.058 / 0.859",
        }
      `);
    });
    test("transform dark color with alpha to variables", () => {
      const result = transform(hsl_colors.amberDarkA, { color_space: "oklch", mode: "var-a" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-a-1": "0.0000 0.0000 0.0000 / 0",
          "amber-a-10": "0.87238 0.15454 88.189 / 0.98",
          "amber-a-11": "0.80260 0.16877 73.148 / 0.938",
          "amber-a-12": "0.97785 0.030094 91.648 / 0.98",
          "amber-a-2": "0.73430 0.18269 54.600 / 0.036",
          "amber-a-3": "0.71164 0.19441 47.798 / 0.094",
          "amber-a-4": "0.72484 0.18884 51.040 / 0.143",
          "amber-a-5": "0.73760 0.18355 54.583 / 0.192",
          "amber-a-6": "0.76482 0.17530 62.451 / 0.25",
          "amber-a-7": "0.76798 0.17248 62.991 / 0.331",
          "amber-a-8": "0.77195 0.17382 64.552 / 0.442",
          "amber-a-9": "0.82472 0.16400 78.098 / 0.98",
        }
      `);
    });
    test("transform black with alpha to variables", () => {
      const result = transform(hsl_colors.blackA, { color_space: "oklch", mode: "var-a" });
      expect(result).toMatchInlineSnapshot(`
        {
          "black-a-1": "0.0000 0.0000 0.0000 / 0.012",
          "black-a-10": "0.0000 0.0000 0.0000 / 0.478",
          "black-a-11": "0.0000 0.0000 0.0000 / 0.565",
          "black-a-12": "0.0000 0.0000 0.0000 / 0.91",
          "black-a-2": "0.0000 0.0000 0.0000 / 0.027",
          "black-a-3": "0.0000 0.0000 0.0000 / 0.047",
          "black-a-4": "0.0000 0.0000 0.0000 / 0.071",
          "black-a-5": "0.0000 0.0000 0.0000 / 0.09",
          "black-a-6": "0.0000 0.0000 0.0000 / 0.114",
          "black-a-7": "0.0000 0.0000 0.0000 / 0.141",
          "black-a-8": "0.0000 0.0000 0.0000 / 0.22",
          "black-a-9": "0.0000 0.0000 0.0000 / 0.439",
        }
      `);
    });
    test("transform color to css color functions", () => {
      const result = transform(hsl_colors.amber, { color_space: "oklch", mode: "func" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-1": "oklch(0.9943 0.0033 83.058)",
          "amber-10": "oklch(0.7853 0.1677 66.954)",
          "amber-11": "oklch(0.551 0.138 54.067)",
          "amber-12": "oklch(0.3062 0.0773 44.209)",
          "amber-2": "oklch(0.9836 0.0169 84.586)",
          "amber-3": "oklch(0.9672 0.0422 90.381)",
          "amber-4": "oklch(0.9464 0.0655 89.008)",
          "amber-5": "oklch(0.9244 0.0877 87.388)",
          "amber-6": "oklch(0.8875 0.1067 80.372)",
          "amber-7": "oklch(0.8234 0.1236 75.674)",
          "amber-8": "oklch(0.7593 0.1524 69.344)",
          "amber-9": "oklch(0.8173 0.164 75.994)",
        }
      `);
    });
    test("transform color with alpha to css color functions", () => {
      const result = transform(hsl_colors.amberA, { color_space: "oklch", mode: "func" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-a-1": "oklch(0.6537 0.1369 74.868 / 0.016)",
          "amber-a-10": "oklch(0.7648 0.1753 62.451 / 0.891)",
          "amber-a-11": "oklch(0.5417 0.1386 52.369 / 0.98)",
          "amber-a-12": "oklch(0.2807 0.0809 44.415 / 0.965)",
          "amber-a-2": "oklch(0.8025 0.1703 73.486 / 0.071)",
          "amber-a-3": "oklch(0.833 0.1715 82.115 / 0.165)",
          "amber-a-4": "oklch(0.8248 0.1709 79.884 / 0.263)",
          "amber-a-5": "oklch(0.817 0.1705 77.689 / 0.365)",
          "amber-a-6": "oklch(0.7869 0.1715 68.942 / 0.475)",
          "amber-a-7": "oklch(0.7276 0.1635 64.791 / 0.612)",
          "amber-a-8": "oklch(0.7185 0.1642 62.73 / 0.832)",
          "amber-a-9": "oklch(0.794 0.1709 71.058 / 0.859)",
        }
      `);
    });
    test("transform black with alpha to css color functions", () => {
      const result = transform(hsl_colors.blackA, { color_space: "oklch", mode: "func" });
      expect(result).toMatchInlineSnapshot(`
        {
          "black-a-1": "oklch(0 0 0 / 0.012)",
          "black-a-10": "oklch(0 0 0 / 0.478)",
          "black-a-11": "oklch(0 0 0 / 0.565)",
          "black-a-12": "oklch(0 0 0 / 0.91)",
          "black-a-2": "oklch(0 0 0 / 0.027)",
          "black-a-3": "oklch(0 0 0 / 0.047)",
          "black-a-4": "oklch(0 0 0 / 0.071)",
          "black-a-5": "oklch(0 0 0 / 0.09)",
          "black-a-6": "oklch(0 0 0 / 0.114)",
          "black-a-7": "oklch(0 0 0 / 0.141)",
          "black-a-8": "oklch(0 0 0 / 0.22)",
          "black-a-9": "oklch(0 0 0 / 0.439)",
        }
      `);
    });
  });
  describe("transform hsl", () => {
    test("transform color to variables", () => {
      const result = transform(hsl_colors.amber, { color_space: "hsl", mode: "var" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-1": "39.000 70.000% 99.000%",
          "amber-10": "35.000 100.00% 55.500%",
          "amber-11": "30.000 100.00% 34.000%",
          "amber-12": "20.000 80.000% 17.000%",
          "amber-2": "40.000 100.00% 96.500%",
          "amber-3": "44.000 100.00% 91.700%",
          "amber-4": "43.000 100.00% 86.800%",
          "amber-5": "42.000 100.00% 81.800%",
          "amber-6": "38.000 99.700% 76.300%",
          "amber-7": "36.000 86.100% 67.100%",
          "amber-8": "35.000 85.200% 55.100%",
          "amber-9": "39.000 100.00% 57.000%",
        }
      `);
    });
    test("transform dark color to variables", () => {
      const result = transform(hsl_colors.amberDark, { color_space: "hsl", mode: "var" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-1": "36.000 100.00% 6.1000%",
          "amber-10": "43.000 100.00% 64.000%",
          "amber-11": "39.000 90.000% 49.800%",
          "amber-12": "39.000 97.000% 93.200%",
          "amber-2": "35.000 100.00% 7.6000%",
          "amber-3": "32.000 100.00% 10.200%",
          "amber-4": "32.000 100.00% 12.400%",
          "amber-5": "33.000 100.00% 14.600%",
          "amber-6": "35.000 100.00% 17.100%",
          "amber-7": "35.000 91.000% 21.600%",
          "amber-8": "36.000 100.00% 25.500%",
          "amber-9": "39.000 100.00% 57.000%",
        }
      `);
    });
    test("transform color with alpha to variables", () => {
      const result = transform(hsl_colors.amberA, { color_space: "hsl", mode: "var-a" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-a-1": "40.000 94.900% 38.700% / 0.016",
          "amber-a-10": "35.000 100.00% 50.000% / 0.891",
          "amber-a-11": "29.000 100.00% 33.600% / 0.98",
          "amber-a-12": "20.000 99.800% 14.100% / 0.965",
          "amber-a-2": "40.000 100.00% 50.300% / 0.071",
          "amber-a-3": "44.000 100.00% 50.100% / 0.165",
          "amber-a-4": "43.000 100.00% 50.000% / 0.263",
          "amber-a-5": "42.000 100.00% 50.000% / 0.365",
          "amber-a-6": "38.000 100.00% 50.100% / 0.475",
          "amber-a-7": "36.000 99.900% 46.200% / 0.612",
          "amber-a-8": "35.000 99.800% 46.000% / 0.832",
          "amber-a-9": "39.000 100.00% 50.000% / 0.859",
        }
      `);
    });
    test("transform dark color with alpha to variables", () => {
      const result = transform(hsl_colors.amberDarkA, { color_space: "hsl", mode: "var-a" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-a-1": "0.0000 0.0000% 0.0000% / 0",
          "amber-a-10": "44.000 100.00% 64.200% / 0.98",
          "amber-a-11": "39.000 99.900% 52.700% / 0.938",
          "amber-a-12": "45.000 100.00% 94.200% / 0.98",
          "amber-a-2": "31.000 100.00% 49.700% / 0.036",
          "amber-a-3": "27.000 100.00% 49.900% / 0.094",
          "amber-a-4": "29.000 100.00% 50.000% / 0.143",
          "amber-a-5": "31.000 100.00% 50.000% / 0.192",
          "amber-a-6": "35.000 100.00% 50.000% / 0.25",
          "amber-a-7": "34.000 99.600% 52.900% / 0.331",
          "amber-a-8": "36.000 100.00% 50.000% / 0.442",
          "amber-a-9": "40.000 100.00% 57.200% / 0.98",
        }
      `);
    });
    test("transform black with alpha to variables", () => {
      const result = transform(hsl_colors.blackA, { color_space: "hsl", mode: "var-a" });
      expect(result).toMatchInlineSnapshot(`
        {
          "black-a-1": "0.0000 0.0000% 0.0000% / 0.012",
          "black-a-10": "0.0000 0.0000% 0.0000% / 0.478",
          "black-a-11": "0.0000 0.0000% 0.0000% / 0.565",
          "black-a-12": "0.0000 0.0000% 0.0000% / 0.91",
          "black-a-2": "0.0000 0.0000% 0.0000% / 0.027",
          "black-a-3": "0.0000 0.0000% 0.0000% / 0.047",
          "black-a-4": "0.0000 0.0000% 0.0000% / 0.071",
          "black-a-5": "0.0000 0.0000% 0.0000% / 0.09",
          "black-a-6": "0.0000 0.0000% 0.0000% / 0.114",
          "black-a-7": "0.0000 0.0000% 0.0000% / 0.141",
          "black-a-8": "0.0000 0.0000% 0.0000% / 0.22",
          "black-a-9": "0.0000 0.0000% 0.0000% / 0.439",
        }
      `);
    });
    test("transform color to css color functions", () => {
      const result = transform(hsl_colors.amber, { color_space: "hsl", mode: "func" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-1": "hsl(39 70% 99%)",
          "amber-10": "hsl(35 100% 55.5%)",
          "amber-11": "hsl(30 100% 34%)",
          "amber-12": "hsl(20 80% 17%)",
          "amber-2": "hsl(40 100% 96.5%)",
          "amber-3": "hsl(44 100% 91.7%)",
          "amber-4": "hsl(43 100% 86.8%)",
          "amber-5": "hsl(42 100% 81.8%)",
          "amber-6": "hsl(38 99.7% 76.3%)",
          "amber-7": "hsl(36 86.1% 67.1%)",
          "amber-8": "hsl(35 85.2% 55.1%)",
          "amber-9": "hsl(39 100% 57%)",
        }
      `);
    });
    test("transform color with alpha to css color functions", () => {
      const result = transform(hsl_colors.amberA, { color_space: "hsl", mode: "func" });
      expect(result).toMatchInlineSnapshot(`
        {
          "amber-a-1": "hsl(40 94.9% 38.7% / 0.016)",
          "amber-a-10": "hsl(35 100% 50% / 0.891)",
          "amber-a-11": "hsl(29 100% 33.6% / 0.98)",
          "amber-a-12": "hsl(20 99.8% 14.1% / 0.965)",
          "amber-a-2": "hsl(40 100% 50.3% / 0.071)",
          "amber-a-3": "hsl(44 100% 50.1% / 0.165)",
          "amber-a-4": "hsl(43 100% 50% / 0.263)",
          "amber-a-5": "hsl(42 100% 50% / 0.365)",
          "amber-a-6": "hsl(38 100% 50.1% / 0.475)",
          "amber-a-7": "hsl(36 99.9% 46.2% / 0.612)",
          "amber-a-8": "hsl(35 99.8% 46% / 0.832)",
          "amber-a-9": "hsl(39 100% 50% / 0.859)",
        }
      `);
    });
    test("transform black with alpha to css color functions", () => {
      const result = transform(hsl_colors.blackA, { color_space: "hsl", mode: "func" });
      expect(result).toMatchInlineSnapshot(`
        {
          "black-a-1": "hsl(0 0% 0% / 0.012)",
          "black-a-10": "hsl(0 0% 0% / 0.478)",
          "black-a-11": "hsl(0 0% 0% / 0.565)",
          "black-a-12": "hsl(0 0% 0% / 0.91)",
          "black-a-2": "hsl(0 0% 0% / 0.027)",
          "black-a-3": "hsl(0 0% 0% / 0.047)",
          "black-a-4": "hsl(0 0% 0% / 0.071)",
          "black-a-5": "hsl(0 0% 0% / 0.09)",
          "black-a-6": "hsl(0 0% 0% / 0.114)",
          "black-a-7": "hsl(0 0% 0% / 0.141)",
          "black-a-8": "hsl(0 0% 0% / 0.22)",
          "black-a-9": "hsl(0 0% 0% / 0.439)",
        }
      `);
    });
  });
}
