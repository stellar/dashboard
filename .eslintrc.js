module.exports = {
  extends: ["@stellar/eslint-config", "plugin:import/typescript"],
  rules: {
    "no-console": "off",
    "import/no-unresolved": "off",
    "react/jsx-filename-extension": ["error", { extensions: [".tsx", ".jsx"] }],
    "no-plusplus": "off",
    "jsdoc/check-indentation": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "typeProperty",
        format: ["PascalCase", "UPPER_CASE", "camelCase", "snake_case"],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
    ],
  },
};
