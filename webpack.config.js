const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const packageJson = require('./package.json')

module.exports = {
  mode: 'production',
  target: 'web',
  context: `${__dirname}/src`,
  entry: {
    background: './background',
    'content-script': './content-script',
    'content-script-iframe': './content-script-iframe',
    options: './options',
    popup: './popup',
  },
  output: {
    path: `${__dirname}/app/`,
    filename: '[name].js',
    publicPath: './',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.s(c|a)ss$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(css|jpg|gif|png|woff|woff2|eot|ttf)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]',
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'livecanvas-icon.png',
          to: 'icon.png',
        },
        {
          from: 'manifest.json',
          transform: (content) => {
            return Buffer.from(
              JSON.stringify({
                ...JSON.parse(content.toString()),
                name: packageJson.productName || packageJson.name,
                description: packageJson.description,
                version: packageJson.version,
              })
            )
          },
        },
        'content-script.css',
        'content-script-iframe.css',
      ],
    }),
    new HtmlWebpackPlugin({
      template: './options.html',
      filename: './options.html',
      chunks: ['options'],
    }),
    new HtmlWebpackPlugin({
      template: './popup.html',
      filename: './popup.html',
      chunks: ['popup'],
    }),
    new VueLoaderPlugin(),
    new VuetifyLoaderPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.vue'],
    alias: {
      '~': `${__dirname}/src/`,
      '~~': `${__dirname}/`,
      vue$: 'vue/dist/vue.runtime.js',
    },
  },
}
