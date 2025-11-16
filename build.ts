// 実行例
// pnpm tsx build ./src/functions/dummy/index.ts ./dist/functions/dummy/index.mjs

import { build } from "esbuild";

if (process.argv.length !== 4) {
  console.error("Usage: pnpm tsx build <entryPoint> <outfile>");
  process.exit(1);
}

const [, , entryPoint, outfile] = process.argv;

console.log(`Building: ${entryPoint} → ${outfile}`);

await build({
  entryPoints: [entryPoint],
  outfile,
  platform: "node",
  target: "node22",
  format: "esm",
  bundle: true,
  sourcemap: true,
  minify: false,
  external: ["@aws-sdk/*", "@sparticuz/chromium", "playwright-core"],
});

console.log("Build completed.");
