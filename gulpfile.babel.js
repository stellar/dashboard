'use strict';

var _       = require('lodash');
var bs      = require('browser-sync').create();
var gulp    = require('gulp');
var path    = require('path');
var webpack = require("webpack");

gulp.task('default', ['develop']);

var webpackOptions = {
  entry: {
    app: "./src/app.js",
    vendor: ["react", "react-dom", "lodash", "muicss", "stellar-sdk", "axios", "d3", "react-d3-components", "fbemitter"]
  },
  devtool: "source-map",
  resolve: {
    root: ['src'],
    modulesDirectories: ["node_modules"]
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader', query: {presets: ['es2015', 'react']}},
      {test: /\.json$/, loader: 'json'},
      {test: /\.html$/, loader: 'file?name=[name].html'},
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/ed25519/)
  ]
};

gulp.task('develop', function(done) {
  var mixpanelSecret = '7d6b4a91f04cd8228ff3e2387f26277d' // empty project
  if (process.env.MIXPANEL_SECRET) {
    mixpanelSecret = process.env.MIXPANEL_SECRET;
  }

  var options = merge(webpackOptions, {
    output: {
      filename: "[name].js",
      path: './.tmp'
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js"),
      new webpack.DefinePlugin({
        'MIXPANEL_SECRET': JSON.stringify(mixpanelSecret)
      }),
    ]
  });

  var watchOptions = {
    aggregateTimeout: 300
  };

  var bsInitialized = false;

  var compiler = webpack(options);
  compiler.purgeInputFileSystem();
  compiler.watch(watchOptions, function(error, stats) {
    if (!bsInitialized) {
      gulp.watch(".tmp/**/*").on("change", bs.reload);
      bs.init({
        notify: false,
        server: "./.tmp"
      });
      bsInitialized = true;
    }
    console.log(stats.toString({
      hash: false,
      version: false,
      timings: true,
      chunks: false,
      colors: true
    }));
  });
});

gulp.task('build', function(done) {
  var options = merge(webpackOptions, {
    bail: true,
    output: {
      // TODO chunkhash
      filename: "[name].js",//"[name]-[chunkhash].js",
      path: './dist'
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js"),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
        'MIXPANEL_SECRET': JSON.stringify(process.env.MIXPANEL_SECRET)
      }),
      new webpack.optimize.UglifyJsPlugin()
    ]
  });

  var compiler = webpack(options);
  compiler.purgeInputFileSystem();
  compiler.run(done);
});


function merge(object1, object2) {
  return _.mergeWith(object1, object2, function(a, b) {
    if (_.isArray(a)) {
      return a.concat(b);
    }
  });
}
