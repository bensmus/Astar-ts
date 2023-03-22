const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin') // Plugin installed with NPM

module.exports = {
    mode: 'development',
    entry: {
      bundle: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundled.js',
      clean: true, // Delete dist folder before build
    },
    devtool: 'source-map',
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      port: 3000,
      open: true,
      hot: true,
      compress: true,
      historyApiFallback: true,
    },
    module: {
      rules: [
        // Without this rule, Webpack interprets everything in src as a JavaScript module
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i, // Javascript RegEx for image files
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/template.html', // What Webpack uses to generate the index.html file
      })
    ]
  }