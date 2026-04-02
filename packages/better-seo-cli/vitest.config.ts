import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      /** TUI flows are exercised manually / via binary smoke; clack prompts are costly to branch-cover. */
      exclude: ["src/**/*.test.ts", "src/cli.ts", "src/launch-interactive.ts"],
      thresholds: {
        lines: 80,
        functions: 75,
        branches: 65,
        statements: 80,
      },
    },
  },
})
