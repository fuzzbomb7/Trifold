// This code get the current version number
const fs = require('fs')
const webpack = require('webpack')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

module.exports = {
  configureWebpack: {
    plugins: [
      // Version number
      new webpack.DefinePlugin({
        'process.env': {
          PACKAGE_VERSION: '"' + version + '"'
        }
      })
    ],
    "devtool": "source-map",
  },

  // Progressive web app configuration
  pwa: {
    themeColor: '#ffffff',
    workboxOptions: {
      exclude: [
        'img/1px.png'
      ],
      runtimeCaching: [
        {
          urlPattern: /https:\/\/trifold-cdn\.azureedge\.net\/.+/,
          handler: 'CacheFirst',
        }
      ]
    },
    name: 'Prost!'
  },
  
  "transpileDependencies": [
    "vuetify"
  ],
}
