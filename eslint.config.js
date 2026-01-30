import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        chrome: "readonly",
        webextensions: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,
      // TypeScript ESLint recommended rules
      ...(tseslint.configs?.recommended?.rules || {}),
      "no-console": [
        "error",
        {
          allow: ["warn", "error"],
        },
      ],
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "multi-line"],
      "no-implicit-coercion": "error",
      "no-control-regex": "off",
    },
  },
  {
    files: ["src/popup/**/*.{js,ts}", "src/background/**/*.{js,ts}"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        alert: "readonly",
        console: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        Blob: "readonly",
        OffscreenCanvas: "readonly",
        DOMParser: "readonly",
        ClipboardItem: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-alert": "off",
    },
  },
  {
    files: ["__tests__/**/*.{js,ts}"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        jest: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        global: "readonly",
        process: "readonly",
        console: "readonly",
        Document: "readonly",
        DOMParser: "readonly",
        CanvasRenderingContext2D: "readonly",
        Blob: "readonly",
        OffscreenCanvas: "readonly",
        navigator: "readonly",
      },
    },
  },
  {
    files: ["scripts/**/*.{js,ts}"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: ["node_modules/**", "web-ext-artifacts/**", "dist/**", "build/**"],
  },
];
