var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: ['./src/js/entry.js'], // file extension after index is optional for .js files
	output: {
		path: path.join(__dirname, 'dist'),
		filename: './js/index.js'
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
		loaders: [
			{
				test: /\.css$/,
				loaders: ['style', 'css', "sass"]
			},
			{
		        test: /\.scss$/,
		        loaders: ["style", "css", "sass", "css?sourceMap", "sass?sourceMap"]
		    }
		]
	}
}