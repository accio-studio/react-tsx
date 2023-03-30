import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    includeSource: ["scripts/**/*.{ts,tsx}"],
    environment: "happy-dom",
  },
});
