const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const entryFile = path.resolve(__dirname, 'src', 'index.tsx');
const outputDir = path.resolve(__dirname, 'build');

module.exports = {
  entry: entryFile,
  output: {
    path: outputDir,
    publicPath: "/static/",
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: [
        'node_modules',
        path.resolve(__dirname + '/src')
    ],
    alias: {
        '@': path.resolve(__dirname + '/src')
    },
  },
  devtool: "eval-source-map", // TODO: This might need to change, we also might want something different for prod
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|mp4)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    // MAYBE HMR plugin?
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/public/index.html'),
      favicon: path.resolve(__dirname, 'src/public/favicon.ico'),
    }),
  ],
  devServer: {
    historyApiFallback: true,
    static: outputDir,
    hot: true,
    proxy: {
      "/api": "http://127.0.0.1:5000",
    },
  },
  stats: 'errors-only',
}
