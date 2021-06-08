module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'de',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  },

  configureWebpack: {
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vueVendor: {
            test: /[\\/]node_modules[\\/](@?vue.*)[\\/]/,
            name: "vueVendor"
          },
          d3Vendor: {
            test: /[\\/]node_modules[\\/](d3.*)[\\/]/,
            name: "network"
          },
          layout: {
            test: /[\\/]node_modules[\\/](bootstrap.*|@fortawesome.*)[\\/]/,
            name: "layout"
          }
        }
      }
    }
  }
}