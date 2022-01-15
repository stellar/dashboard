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

// ALEC TODO - remove:
// stellar .eslint-config:
// module.exports = {
//   extends: [
//     "react-app",
//     "./deduped-airbnb-rules",
//     "prettier",
//     "plugin:@typescript-eslint/recommended",
//     "plugin:@typescript-eslint/recommended-requiring-type-checking",
//   ],
//   parser: "@typescript-eslint/parser",
//   parserOptions: {
//     project: "tsconfig.json",
//     sourceType: "module",
//   },
//   plugins: [
//     "eslint-plugin-jsdoc",
//     "eslint-plugin-prefer-arrow",
//     "@typescript-eslint",
//   ],
//   rules: {
//     // OFF
//     "class-methods-use-this": "off",
//     "import/extensions": "off",
//     "import/no-extraneous-dependencies": "off",
//     "import/prefer-default-export": "off",
//     "jsdoc/check-indentation": "off",
//     "jsx-a11y/label-has-for": "off",
//     "jsx-a11y/heading-has-content": "off",
//     "jsx-a11y/label-has-associated-control": "off",
//     "linebreak-style": "off",
//     "lines-between-class-members": "off",
//     "no-underscore-dangle": "off",
//     "no-use-before-define": "off",
//     "no-prototype-builtins": "off",
//     "prefer-arrow/prefer-arrow-functions": "off",
//     "prefer-destructuring": "off",
//     "react/forbid-prop-types": "off",
//     "react/jsx-indent": "off",
//     "react/no-did-mount-set-state": "off",
//     "react/no-did-update-set-state": "off",
//     "react/require-default-props": "off",
//     "react/jsx-one-expression-per-line": "off",
//     "react/destructuring-assignment": "off",
//     "react/jsx-wrap-multilines": "off",
//     "react/jsx-props-no-spreading": "off",
//     "react/prop-types": "off",
//     "valid-jsdoc": "off",

//     // WARN
//     "prefer-object-spread": "warn",
//     "no-debugger": "warn",
//     "no-unused-vars": "warn",
//     "react/no-unused-prop-types": "warn",
//     "react/no-array-index-key": "warn",
//     "react/sort-comp": "warn",
//     "react/default-props-match-prop-types": "warn",
//     "react/prefer-stateless-function": "warn",
//     "react/no-unused-state": "warn",
//     "react/jsx-curly-brace-presence": "warn",
//     "arrow-body-style": "warn",
//     "valid-jsdoc": "warn",
//     "prefer-const": "warn",
//     "import/first": "warn",
//     "import/order": "warn",
//     "object-shorthand": "warn",
//     "react/no-access-state-in-setstate": "warn",
//     "require-await": "warn",

//     // ERROR
//     "jsx-a11y/anchor-is-valid": [
//       "error",
//       {
//         components: ["Link"],
//         specialLink: ["hrefLeft", "hrefRight", "to"],
//         aspects: ["noHref", "invalidHref", "preferButton"],
//       },
//     ],
//     "no-unused-expressions": ["error", { allowTaggedTemplates: true }],
//     "react/jsx-filename-extension": ["error", { extensions: [".js"] }],

//     "no-void": ["error", { allowAsStatement: true }],

//     // TSLINT-TO-ESLINT
//     "@typescript-eslint/adjacent-overload-signatures": "error",
//     "@typescript-eslint/array-type": [
//       "error",
//       {
//         default: "array",
//       },
//     ],
//     "@typescript-eslint/ban-ts-comment": "off",
//     "@typescript-eslint/ban-types": [
//       "error",
//       {
//         types: {
//           Object: {
//             message: "Avoid using the `Object` type. Did you mean `object`?",
//           },
//           Function: {
//             message:
//               "Avoid using the `Function` type. Prefer a specific function type, like `() => void`.",
//           },
//           Boolean: {
//             message: "Avoid using the `Boolean` type. Did you mean `boolean`?",
//           },
//           Number: {
//             message: "Avoid using the `Number` type. Did you mean `number`?",
//           },
//           String: {
//             message: "Avoid using the `String` type. Did you mean `string`?",
//           },
//           Symbol: {
//             message: "Avoid using the `Symbol` type. Did you mean `symbol`?",
//           },
//         },
//       },
//     ],
//     "@typescript-eslint/consistent-type-assertions": "error",
//     "@typescript-eslint/dot-notation": "error",
//     "@typescript-eslint/explicit-module-boundary-types": "off",
//     "@typescript-eslint/member-delimiter-style": [
//       "error",
//       {
//         multiline: {
//           delimiter: "semi",
//           requireLast: true,
//         },
//         singleline: {
//           delimiter: "semi",
//           requireLast: false,
//         },
//       },
//     ],
//     "@typescript-eslint/member-ordering": "error",
//     "@typescript-eslint/naming-convention": [
//       "error",
//       {
//         selector: "default",
//         format: ["camelCase"],
//         leadingUnderscore: "allow",
//         trailingUnderscore: "allow",
//       },

//       {
//         selector: "variable",
//         format: ["camelCase", "UPPER_CASE", "PascalCase"],
//         leadingUnderscore: "allow",
//         trailingUnderscore: "allow",
//       },

//       {
//         selector: "enumMember",
//         format: ["camelCase", "UPPER_CASE", "PascalCase", "snake_case"],
//         leadingUnderscore: "allow",
//         trailingUnderscore: "allow",
//       },

//       {
//         selector: "enum",
//         format: ["UPPER_CASE", "PascalCase"],
//         leadingUnderscore: "allow",
//         trailingUnderscore: "allow",
//       },

//       {
//         selector: "typeLike",
//         format: ["PascalCase"],
//       },

//       {
//         selector: "objectLiteralProperty",
//         format: ["PascalCase", "camelCase"],
//       },

//       {
//         selector: "typeProperty",
//         format: ["PascalCase", "UPPER_CASE", "camelCase", "snake_case"],
//         leadingUnderscore: "allow",
//         trailingUnderscore: "allow",
//       },
//     ],
//     "@typescript-eslint/no-empty-function": "error",
//     "@typescript-eslint/no-empty-interface": "error",
//     "@typescript-eslint/no-explicit-any": "off",
//     "@typescript-eslint/no-floating-promises": "off",
//     "@typescript-eslint/no-inferrable-types": "off",
//     "@typescript-eslint/no-misused-new": "error",
//     "@typescript-eslint/no-misused-promises": "off",
//     "@typescript-eslint/no-namespace": "off",
//     "@typescript-eslint/no-non-null-assertion": "off",
//     "@typescript-eslint/no-parameter-properties": "off",
//     "@typescript-eslint/no-shadow": [
//       "error",
//       {
//         hoist: "all",
//       },
//     ],
//     "@typescript-eslint/no-unsafe-assignment": "off",
//     "@typescript-eslint/no-unsafe-call": "off",
//     "@typescript-eslint/no-unsafe-member-access": "off",
//     "@typescript-eslint/no-unsafe-return": "off",
//     "@typescript-eslint/no-unused-expressions": "error",
//     "@typescript-eslint/no-use-before-define": "off",
//     "@typescript-eslint/no-var-requires": "error",
//     "@typescript-eslint/prefer-for-of": "error",
//     "@typescript-eslint/prefer-function-type": "error",
//     "@typescript-eslint/prefer-namespace-keyword": "error",
//     "@typescript-eslint/prefer-regexp-exec": "off",
//     "@typescript-eslint/restrict-template-expressions": "off",
//     "@typescript-eslint/semi": ["error", "always"],
//     "@typescript-eslint/triple-slash-reference": [
//       "error",
//       {
//         path: "always",
//         types: "prefer-import",
//         lib: "always",
//       },
//     ],
//     "@typescript-eslint/type-annotation-spacing": "error",
//     "@typescript-eslint/unified-signatures": "error",
//     "brace-style": ["error", "1tbs"],
//     "comma-dangle": "error",
//     complexity: "off",
//     "constructor-super": "error",
//     curly: ["error", "all"],
//     "default-case": "error",
//     "eol-last": "off",
//     eqeqeq: ["error", "smart"],
//     "guard-for-in": "error",
//     "id-blacklist": [
//       "error",
//       "any",
//       "Number",
//       "number",
//       "String",
//       "string",
//       "Boolean",
//       "boolean",
//       "Undefined",
//       "undefined",
//     ],
//     "id-match": "error",
//     "jsdoc/check-alignment": "error",
//     "jsdoc/check-indentation": "error",
//     "jsdoc/newline-after-description": "error",
//     "max-classes-per-file": ["error", 1],
//     "max-len": [
//       "error",
//       {
//         code: 80,
//         ignoreUrls: true,
//         ignoreRegExpLiterals: true,
//         ignoreTemplateLiterals: true,
//         ignoreStrings: true,

//         // Prettier doesn't play nice with eslint's max-len rule.
//         // The recommendation is to disable max-len entirely if you're using
//         // prettier. Instead, let's ignore import lines.
//         // https://github.com/prettier/prettier/issues/1954
//         ignorePattern:
//           "^(import\\W.*;|\\s*\\/\\/ TODO:.*|\\s\\/\\/\\seslint-disable-next-line\\s)",
//       },
//     ],
//     "new-parens": "error",
//     "no-bitwise": "error",
//     "no-caller": "error",
//     "no-cond-assign": "error",
//     "no-console": ["error", { allow: ["assert"] }],
//     "no-debugger": "error",
//     "no-empty": "error",
//     "no-eval": "error",
//     "no-fallthrough": "error",
//     "no-invalid-this": "off",
//     "no-multiple-empty-lines": "error",
//     "no-new-wrappers": "error",
//     "no-redeclare": "error",
//     "no-throw-literal": "error",
//     "no-trailing-spaces": "off",
//     "no-undef-init": "error",
//     "no-unsafe-finally": "error",
//     "no-unused-labels": "error",
//     "no-var": "error",
//     "object-shorthand": "error",
//     "one-var": ["error", "never"],
//     "prefer-const": "error",
//     radix: "error",
//     "spaced-comment": [
//       "error",
//       "always",
//       {
//         markers: ["/"],
//       },
//     ],
//     "use-isnan": "error",
//     "valid-typeof": "off",
//   },
//   overrides: [
//     {
//       files: ["**/ducks/**/*.js", "**/ducks/**/*.ts"],
//       rules: {
//         "no-param-reassign": "off",
//       },
//     },

//     {
//       files: ["**/*.ts", "**/*.tsx"],
//       rules: {
//         "no-unused-vars": "off",
//         "no-shadow": "off",
//         "@typescript-eslint/indent": "off",
//       },
//     },
//   ],
// };
