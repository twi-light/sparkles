import { resolve } from 'path'
import Package from './package.json'
import {
  HotModuleReplacementPlugin,
  NamedModulesPlugin,
  EnvironmentPlugin
} from 'webpack'
import BabiliPlugin from 'babili-webpack-plugin'
import OfflinePlugin from 'offline-plugin'

import eslintOptions from './.eslintrc.json'

import {readFileSync} from 'fs'
const babelOptions = JSON.parse(readFileSync(resolve(__dirname, '.babelrc')))

const production = !/dev/i.test(`${process.argv}`)

export default {
  entry: {
    [`${Package.name}`]: production ? `./src/${Package.name}.lsc` : [
      'react-hot-loader/patch',
      `./src/${Package.name}.lsc`
    ]
  },
  output: {
    path: __dirname,
    filename: `${Package.name}.js`,
    publicPath: '/'
  },
  module: {
    rules: [{
      test: /\.lsc$/,
      use: [{
        loader: 'babel-loader',
        options: production ? babelOptions : {
          "presets": [
            ["env", {
              "targets": {
                "chrome": 55
              }
            }],
            "lightscript",
            "stage-3"
          ],
          "plugins": ["tcomb"]
        }
      }, {
        loader: 'eslint-loader',
        options: eslintOptions
      }]
    }, {
      test: /\.styl/,
      loaders: [
        'style-loader',
        'css-loader',
        'stylus-loader',
        'stylint-loader'
      ]
    }]
  },
  resolve: {
    modules: [
      resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.json', '.lsc', '.styl']
  },
  devtool: production ? 'source-map' : 'cheap-module-eval-source-map',
  context: __dirname,
  target: 'web',
  devServer: {
    contentBase: __dirname,
    hot: true
  },
  plugins: production ? [
    new EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG: false
    }),
    new OfflinePlugin({
      externals: [
        'index.html'
      ],
    }),
    new BabiliPlugin()
  ] : [
    new EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: true
    }),
    new NamedModulesPlugin(),
    new HotModuleReplacementPlugin()
  ]
}
