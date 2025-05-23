import eslint from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "dist-ssr"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  unicorn.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            kebabCase: true,
            pascalCase: true,
            snakeCase: false,
          },
        },
      ],
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            env: false,
            envs: false,
            prop: false,
            props: false,
            ref: false,
            refs: false,
          },
        },
      ],
    },
  },
);
