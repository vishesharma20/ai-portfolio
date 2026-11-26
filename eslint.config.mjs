import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// `eslint-config-next` 15.x still ships its presets ("next/core-web-vitals",
// "next/typescript") in the legacy eslintrc format rather than as native
// flat configs. FlatCompat is ESLint's own officially documented bridge for
// consuming legacy-format shareable configs from a flat `eslint.config.*`
// file under ESLint 9 — this is the standard migration path (the same one
// `create-next-app` generates for new Next.js 15 projects), not a shim
// invented for this project.
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
