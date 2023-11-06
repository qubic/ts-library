//webpack.config.js
const path = require('path');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: "./src/index.ts",
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "qubic-js-library.js",
    library: "qli",
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { 
        test: /\.ts?$/,
        loader: "ts-loader"
      }
    ]
  }
};