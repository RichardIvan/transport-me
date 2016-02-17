var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: {
    'dev-server': 'webpack-dev-server/client?http://localhost:8080',
    'hot-dev-server': 'webpack/hot/dev-server',
    index: './src/js/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: './js/[name].js' // Template based on keys in entry above
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new BrowserSyncPlugin(
      // BrowserSync options
      {
        // browse to http://localhost:3000/ during development
        host: 'localhost',
        port: 3000,
        // proxy the Webpack Dev Server endpoint
        // (which should be serving on http://localhost:3100/)
        // through BrowserSync
        proxy: 'http://localhost:8080/'
      },
      // plugin optionss
      {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: false
      }
    ),
    new ExtractTextPlugin('./main.css', { allChunks: true })
  ],
  module: {
    loaders: [{
      test: /\.css$/,
      loaders: ['style', 'css']
    },
    {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]&sourceMap!postcss-loader!sass')
    },
    {
      test: /\.js$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/,
      include: path.join(__dirname, 'src')
    },
    {
      test: /\.vue$/,
      loader: 'vue'
    },
    {
      test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'
    }]
  },
  postcss: [
    require('autoprefixer')
  ],
  sassLoader: {
    includePaths: [path.resolve(__dirname, 'src')]
  },
  devServer: {
    contentBase: './dist',
    hot: true
  },
  externals: {
    jquery: {
      root: 'jQuery',
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery'
    }
  }
}
