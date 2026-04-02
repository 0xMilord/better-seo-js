import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/json-ld.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ["next", "react", "react-dom", "better-seo.js"],
  esbuildOptions(options) {
    options.jsx = "automatic"
  },
})
