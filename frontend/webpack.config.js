const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const entryFile = path.resolve(__dirname, 'src', 'index.tsx');
const outputDir = path.resolve(__dirname, 'src', 'public');

module.exports = {
  entry: entryFile,
  output: {
    path: outputDir,
    publicPath: "/",
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
      template: path.resolve(__dirname, 'src/public/index.html'),
    }),
  ],
  devServer: {
    historyApiFallback: true,
    static: outputDir,
    hot: true,
  },
  stats: 'errors-only',
}
