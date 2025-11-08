// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const IGNORE_PATTERNS = [
  "node_modules/",
  "pnpm-lock.yaml",
  "dist/",
  ".aws-sam/",
  "*.log",
  "*.tsbuildinfo",
];

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "comma-dangle": ["error", "always-multiline"],
    },
  },
  {
    ignores: IGNORE_PATTERNS,
  },
);
