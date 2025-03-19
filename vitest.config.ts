import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      exclude: [
        "release.config.cjs",
        "**/*.d.ts",
        "**/*.config.ts",
        "**/index.*",
        "**/mocks/**",
      ],
      provider: "v8",
    },
  },
});
