// eslint-disable-next-line import/no-unresolved
import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "**/build/",
    "**/install/",
    "**/flatpak/",
    "**/node_modules/",
    "**/repo/",
    "**/troll/",
  ]),
  {
    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
      ),
    ),

    languageOptions: {
      globals: {
        Debugger: "readonly",
        GIRepositoryGType: "readonly",
        Intl: "readonly",
        imports: "readonly",
        pkg: "readonly",
        log: "readonly",
        logError: "readonly",
        print: "readonly",
        printerr: "readonly",
        ARGV: "readonly",
        window: "readonly",
        globalThis: "readonly",
        __DEV__: "readonly",
        TextDecoder: "readonly",
        TextEncoder: "readonly",
        console: "readonly",
      },

      parserOptions: {
        ecmaVersion: 2025,
        sourceType: "module",
      },
    },

    rules: {
      "no-unused-vars": [
        "error",
        {
          args: "none",
        },
      ],

      "no-restricted-globals": ["error", "window", "Intl", "Debugger"],
      strict: ["error"],
      eqeqeq: ["error", "always"],
      "no-implicit-globals": "error",
      "no-var": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "import/extensions": ["error", "ignorePackages"],

      "import/no-unresolved": [
        "error",
        {
          ignore: [
            "gi://*",
            "cairo",
            "gettext",
            "system",
            "resource://*",
            "troll",
          ],
        },
      ],
    },
  },
]);
