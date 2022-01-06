const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: path.resolve(__dirname, '..', './build'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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
      // {
      //   test: /\.(scss|css)$/,
      //   use: ['style-loader', 'css-loader'],
      // },
      // {
      //   test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
      //   type: 'asset/resource',
      // },
      // {
      //   test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
      //   type: 'asset/inline',
      // },
    ],
  },
  plugins: [
    // MAYBE HMR plugin?
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],
  stats: 'errors-only',
}
