// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:storybook/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "react",
    "react-hooks",
    "simple-import-sort",
    "@typescript-eslint",
    "eslint-plugin-react-compiler",
    "deprecate",
  ],
  rules: {
    "react/no-unknown-property": ["error", { ignore: ["css"] }],
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "error", // Checks effect dependencies
    "react-compiler/react-compiler": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": "error",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // Packages `react` related packages come first.
          ["^react", "^@?\\w", "^@emotion"],
          // Arize packages.
          ["^(@arizeai)(/.*|$)"],
          // internal packages.
          ["^(@phoenix)(/.*|$)"],
          // Side effect imports.
          ["^\\u0000"],
          // Parent imports. Put `..` last.
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          // Other relative imports. Put same-folder imports and `.` last.
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          // Style imports.
          ["^.+\\.?(css)$"],
        ],
      },
    ],
    "deprecate/import": [
      "error",
      {
        name: "Accordion",
        module: "@arizeai/components",
        use: "import { DisclosureGroup, Disclosure, DisclosureTrigger, DisclosurePanel } from '@phoenix/components'",
      },
      {
        name: "Button",
        module: "@arizeai/components",
        use: "@phoenix/components",
      },
      {
        name: "Icon",
        module: "@arizeai/components",
        use: "@phoenix/components",
      },
      {
        name: "Icons",
        module: "@arizeai/components",
        use: "@phoenix/components",
      },
      {
        name: "View",
        module: "@arizeai/components",
        use: "@phoenix/components",
      },
      {
        name: "Flex",
        module: "@arizeai/components",
        use: "@phoenix/components",
      },
      {
        name: "Text",
        module: "@arizeai/components",
        use: "@phoenix/components",
      },
      {
        name: "Heading",
        module: "@arizeai/components",
        use: "@phoenix/components",
      },
      {
        name: "theme",
        module: "@arizeai/components",
      },
    ],
    "no-duplicate-imports": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
