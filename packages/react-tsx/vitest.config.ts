import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    includeSource: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    environment: "happy-dom",
  },
});
