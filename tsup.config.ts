import { defineConfig } from "tsup";

export default defineConfig({
  target: "es2022",
  format: ["esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  entry: [
    "src",
    "!src/**/__tests__/**",
    "!src/**/*.test.*",
    "!**/__mocks__/**",
  ],
});
