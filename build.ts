import { build } from "esbuild";
import { globSync } from "node:fs";

const entryPoints = globSync("./src/functions/*/index.ts");

console.log("Building entry points:", entryPoints);

build({
  entryPoints,
  outdir: "dist/functions",
  outbase: "./src/functions",
  platform: "node",
  target: "node22",
  format: "esm",
  outExtension: { ".js": ".mjs" },
  bundle: true,
  sourcemap: true,
  minify: false,
  external: ["@aws-sdk/*", "@sparticuz/chromium", "playwright-core"],
});

console.log("Build completed.");
