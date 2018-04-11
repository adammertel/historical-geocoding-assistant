const merge = require('webpack-merge');
const { resolve } = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

const commonConfig = require('./common');

module.exports = merge(commonConfig, {
  entry: './main.jsx',
  devtool: 'source-map',
  output: {
    filename: 'js/bundle.min.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: '/hga'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'configs', to: 'configs' },
      { from: 'assets', to: 'assets' }
    ])
  ]
});
