import tsParser from "@typescript-eslint/parser";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Next.js core web vitals
  ...nextVitals,

  // Next.js TypeScript rules
  ...nextTs,

  // Shared rules
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": "off",
      "@typescript-eslint/no-explicit-any": "off",

      // shadcn/ui components extend prop types with empty interfaces, and the
      // Tailwind/Contentlayer configs need CommonJS requires.
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      // Worth reading, not worth failing a build over.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
    },

    settings: {
      next: {
        rootDir: true,
      },
    },
  },

  // TypeScript-specific parser override
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
  },

  // Prettier must be LAST — Tailwind class ordering is handled by
  // prettier-plugin-tailwindcss, not by a lint rule.
  prettier,

  globalIgnores([
    ".next/**",
    ".contentlayer/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
