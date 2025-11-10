// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

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
  importPlugin.flatConfigs.recommended,
  {
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "import/order": [
        "error",
        {
          alphabetize: { order: "asc" },
          "newlines-between": "always",
          warnOnUnassignedImports: true,
        },
      ],
    },
  },
  eslintConfigPrettier,
  {
    rules: {
      "comma-dangle": ["error", "always-multiline"],
    },
  },
  {
    ignores: IGNORE_PATTERNS,
  },
  {
    files: ["src/static/js/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
      },
    },
  },
);
