module.exports = {
  presets: [
    "@babel/preset-react",
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: "last 2 versions",
        },
        modules: false,
        loose: false,
      },
    ],
  ],
  plugins: ["transform-class-properties", "react-hot-loader/babel"],
  env: {
    test: {
      plugins: ["transform-es2015-modules-commonjs"],
    },
  },
};
