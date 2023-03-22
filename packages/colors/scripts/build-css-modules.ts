import * as allColorScales from "../src/hsl";
import Color from "colorjs.io";
import fs from "node:fs/promises";
import path from "node:path";

async function mkdir(
  dir: string,
  options?: {
    recursive?: boolean;
  },
) {
  await fs.stat(dir).catch(() => fs.mkdir(path.join(dir), options));
}

const out_dir = path.resolve(__dirname, "../dist/css");

function to_kebab_case(str: string) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join("-");
}

async function main() {
  // create css dir
  await mkdir(out_dir, { recursive: true });
  // create css/hsl dir
  await mkdir(path.join(out_dir, "hsl"));
  // create css/hsl-var dir
  await mkdir(path.join(out_dir, "hsl-var"));
  // create css/oklch dir
  await mkdir(path.join(out_dir, "oklch"));
  // create css/oklch-var dir
  await mkdir(path.join(out_dir, "oklch-var"));

  Object.entries(allColorScales).forEach(async ([color_scale_name, scale]) => {
    const selector = /DarkA?$/.test(color_scale_name) ? ".dark" : ":root";
    const name = to_kebab_case(color_scale_name);
    // hsl
    const scale_as_hsl_css_properties = Object.entries(scale)
      .map(([name, value]) => `  --${name}: ${value};`)
      .join("\n");
    const scale_as_hsl_css_file = `${selector} {\n${scale_as_hsl_css_properties}\n}`;
    await fs.writeFile(path.join(out_dir, "hsl", `${name}.css`), scale_as_hsl_css_file);
    // oklch
    const scale_as_oklch_css_properties = Object.entries(scale)
      .map(([name, value]) => `  --${name}: ${new Color(value).to("oklch").toString({ precision: 5 })};`)
      .join("\n");
    const scale_as_oklch_css_file = `${selector} {\n${scale_as_oklch_css_properties}\n}`;
    await fs.writeFile(path.join(out_dir, "oklch", `${name}.css`), scale_as_oklch_css_file);
    // variables
    if (!color_scale_name.includes("A")) {
      // hsl
      const scale_as_hsl_var_css_properties = Object.entries(scale)
        .map(
          ([name, value]) =>
            `  --${name}: ${new Color(value)
              .toJSON()
              .coords.map((x, i) => x.toPrecision(5) + (i > 0 ? "%" : ""))
              .join(", ")};`,
        )
        .join("\n");
      const scale_as_hsl_var_css_file = `${selector} {\n${scale_as_hsl_var_css_properties}\n}`;
      await fs.writeFile(path.join(out_dir, "hsl-var", `${name}.css`), scale_as_hsl_var_css_file);
      // oklch
      const scale_as_oklch_var_css_properties = Object.entries(scale)
        .map(
          ([name, value]) =>
            `  --${name}: ${new Color(value)
              .to("oklch")
              .toJSON()
              .coords.map((x) => x.toPrecision(5))
              .join(" ")};`,
        )
        .join("\n");
      const scale_as_oklch_var_css_file = `${selector} {\n${scale_as_oklch_var_css_properties}\n}`;
      await fs.writeFile(path.join(out_dir, "oklch-var", `${name}.css`), scale_as_oklch_var_css_file);
    }
  });
}

main();
