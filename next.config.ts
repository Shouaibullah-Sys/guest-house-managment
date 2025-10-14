import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Use .extends() to translate 'extends' arrays from eslintrc
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Use .config.recommended to access the 'eslint:recommended' rules
    rules: Object.fromEntries(
      Object.keys(compat.config.recommended.rules).map((rule) => [rule, "off"])
    ),
  },
];

export default eslintConfig;
