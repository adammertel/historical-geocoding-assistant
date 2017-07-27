const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");


const uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

module.exports = {
  devtool: 'cheap-source-map',
  entry: './app/main.jsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    filename: './bundle.js'
  },
  module: {
    rules: [
      { 
        test: /\.js[x]?$/, 
        include: path.resolve(__dirname, 'app'), 
        exclude: /node_modules/, 
        loader: 'babel-loader',
        query:
        {
          presets:['react']
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: { importLoaders: 1 },
            },
            'postcss-loader',
          ],
        }),
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [{
            loader: "css-loader"
          }, {
            loader: "sass-loader"
          }],
          // use style-loader in development
          fallback: "style-loader"
        })
      },
      { 
        test: /\.png$/,
        loader: "url-loader",
        query: { mimetype: "image/png" }
      },
      { 
        test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/, 
        loader: 'url?limit=10000&mimetype=application/font-woff' 
      },
      { 
        test: /\.(ttf|eot|svg)(\?[a-z0-9#=&.]+)?$/, 
        loader: 'file' 
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new ExtractTextPlugin({
      filename: "[name].[contenthash].css",
      disable: process.env.NODE_ENV === "development"
    }),
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new ExtractTextPlugin('[name].css'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/assets', to: './assets' },
      { from: './app/config.json', to: 'config.json' }
    ])
  ]
};
