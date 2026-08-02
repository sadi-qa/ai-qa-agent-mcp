import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/server.ts",
        "src/types/**",
      ],
      reporter: [
        "text",
        "json-summary",
        "html",
      ],
      thresholds: {
        statements: 80,
        branches: 65,
        functions: 90,
        lines: 80,
      },
    },
  },
});