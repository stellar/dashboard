const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const ProvidePlugin = require("webpack").ProvidePlugin;
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  optimization: {
    usedExports: true,
    splitChunks: {
      cacheGroups: {
        source: {
          test: /[\\/]src[\\/]/,
          name: "source",
          chunks: "all",
        },
        "vendor-react-redux": {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|react-redux|redux|redux-thunk|@reduxjs)[\\/]/,
          name: "vendor-react-redux",
          chunks: "all",
        },
        "vendor-stellar": {
          test: /[\\/]node_modules[\\/](@stellar|stellar)[\\/]/,
          name: "vendor-stellar",
          chunks: "all",
        },
        "vendor-wallets": {
          test: /[\\/]node_modules[\\/](@albedo|@ledgerhq|trezor)[\\/]/,
          name: "vendor-wallets",
          chunks: "all",
        },
      },
    },
  },
  output: {
    filename: "static/[name].[contenthash].js",
    path: path.resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            // Disable type checker, we will use it in ForkTsCheckerWebpackPlugin
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.(scss|css)$/,
        use: [
          process.env.NODE_ENV !== "production"
            ? "style-loader"
            : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.svg$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: {
                  removeViewBox: false,
                },
              },
            },
          },
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "assets/",
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[name].[ext]",
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    plugins: [
      // This handles aliases and resolves Design System CSS font paths properly
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "./tsconfig.json"),
      }),
    ],
    // Adding node.js modules
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify"),
      url: require.resolve("url"),
      buffer: require.resolve("buffer/"),
    },
  },
  plugins: [
    // Buffer
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new CopyPlugin({
      patterns: [{ from: "./public", to: "./" }],
    }),
    new MiniCssExtractPlugin({
      filename: "static/[name].[contenthash].css",
      chunkFilename: "[id].css",
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new ForkTsCheckerWebpackPlugin(),
    new ESLintPlugin({
      extensions: [".tsx", ".ts", ".js"],
      exclude: "node_modules",
    }),
  ],
};
