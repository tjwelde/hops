'use strict';

var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var findUp = require('find-up');
var UglifyPlugin = require('uglifyjs-webpack-plugin');

var hopsConfig = require('hops-config');

function findNodeModules(start) {
  var modulesDir = findUp.sync('node_modules', { cwd: start });
  var files = fs.readdirSync(modulesDir);
  var containsModules = files.some(function(file) {
    return file.indexOf('.') !== 0;
  });
  if (!containsModules) {
    return findNodeModules(path.dirname(path.dirname(modulesDir)));
  }
  return modulesDir;
}

function shouldIncludeExternalModuleInBundle(module) {
  return true;
}

var modulesDir = findNodeModules(process.cwd());

module.exports = {
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: require.resolve('../shims/node'),
  output: {
    path: hopsConfig.cacheDir,
    publicPath: '/',
    pathinfo: true,
    filename: 'server.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: function(info) {
      return path.resolve(info.absoluteResourcePath).replace(/\\/g, '/');
    },
  },
  context: hopsConfig.appDir,
  resolve: require('../sections/resolve')('node'),
  externals: [
    require('webpack-node-externals')({
      modulesDir: modulesDir,
      whitelist: shouldIncludeExternalModuleInBundle,
    }),
  ],
  module: {
    rules: require('../sections/module-rules')('node'),
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.EnvironmentPlugin(
      Object.assign(
        {
          NODE_ENV: 'development',
        },
        hopsConfig.envVars
      )
    ),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
      sourceMap: true,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyPlugin({ sourceMap: true, cache: true, parallel: true }),
  ],
  performance: {
    hints: false,
  },
  devtool: process.env.NODE_ENV !== 'production' && '#inline-source-map',
  optimization: {
    minimizer: [],
  },
};
