import { FlatCompat } from "@eslint/eslintrc"
import eslint from "@eslint/js"
import perfectionist from "eslint-plugin-perfectionist"
import prettier from "eslint-plugin-prettier/recommended"
import globals from "globals"
import tseslint from "typescript-eslint"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = tseslint.config(
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "plugin:drizzle/recommended"],
    plugins: ["drizzle"],
  }),
  ...tseslint.configs.recommended,
  eslint.configs.recommended,
  { files: ["**/*.{js,mjs,cjs,ts,vue}"] },
  { files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: true,
      },
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
        },
      ],
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  prettier,
)

export default eslintConfig
