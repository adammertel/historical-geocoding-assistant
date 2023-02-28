const webpack = require("webpack");

const fs = require("fs");

const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devtool: "source-map",
  entry: "./app/main.jsx",
  module: {
    rules: [
      {
        test: /\.js$|\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader", // compiles Sass to CSS, using Nodea Sass by default
        ],
      },
      // {
      //   test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
      //   use: [
      //     {
      //       loader: "file-loader",
      //       options: {
      //         name: "[name].[ext]",
      //         outputPath: "fonts/",
      //       },
      //     },
      //   ],
      // },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "./assets/media/",
              publicPath: "./assets/media/",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./app/index.html",
      filename: "./index.html",
      favicon: "./app/assets/favicon.ico",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./app/assets", to: "assets" },
        { from: "./app/data", to: "data" },
        { from: "./app/configs", to: "configs" },
      ],
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    static: "./dist",
    host: "localhost",
    liveReload: true,
    server: "https",
    open: true,
    hot: true,
  },
};
