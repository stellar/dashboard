module.exports = {
  extends: ["@stellar/eslint-config"],
  rules: {
    "no-console": "off",
    "import/no-unresolved": "off",
    "no-await-in-loop": "off",
    "no-constant-condition": "off",
    "@typescript-eslint/naming-convention": ["warn"],
  },
};
