var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: {
    index: './src/js/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: './js/[name].js' // Template based on keys in entry above
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
      },
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  module: {
    loaders: [{
      test: /\.css$/,
      loaders: ['style', 'css', 'sass']
    },
    {
      test: /\.scss$/,
      loaders: ["style", "css?sourceMap&minimize", "sass"]
    },
    {
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src')
    },
    {
      test: /\.vue$/,
      loader: 'vue'
    }
    {
      test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'
    }]
  },
}