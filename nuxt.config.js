// Load dotenv for server/index.js to access env vars from .env file
require('dotenv').config();
const pkg = require('./package');
const bootstrapPkg = require('bootstrap/package');
const bootstrapVuePkg = require('bootstrap-vue/package');
const i18nLocales = require('./plugins/i18n/locales.json');

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Ubuntu:300,400,700%7COpen+Sans:400italic,700italic,400,700&amp;subset=latin,greek,cyrillic' },
      { rel: 'stylesheet', href: `https://cdn.jsdelivr.net/npm/bootstrap@${bootstrapPkg.version}/dist/css/bootstrap.min.css` },
      { rel: 'stylesheet', href: `https://cdn.jsdelivr.net/npm/bootstrap-vue@${bootstrapVuePkg.version}/dist/bootstrap-vue.css` }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: {
    css: false,
    duration: 2500,
    continuous: true
  },

  /*
  ** Global CSS
  */
  css: [
    '@/assets/scss/style.scss'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/bootstrap-vue-plugins',
    '~/plugins/i18n.js',
    '~/plugins/vue-filters'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
    ['@nuxtjs/google-tag-manager', {
      id: process.env.GOOGLE_TAG_MANAGER_ID,
      pageTracking: true
    }],
    ['nuxt-i18n', {
      locales: i18nLocales,
      defaultLocale: 'en',
      lazy: true,
      langDir: 'lang/',
      strategy: 'prefix',
      vueI18n: {
        fallbackLocale: 'en',
        silentFallbackWarn: true
      },
      parsePages: false,
      pages: {
        'i18n_redirect': false
      },
      // Enable browser language detection to automatically redirect user
      // to their preferred language as they visit your app for the first time
      // Set to false to disable
      detectBrowserLanguage: Number(process.env['ENABLE_LANGUAGE_SELECTOR']) ? {
        // If enabled, a cookie is set once a user has been redirected to his
        // preferred language to prevent subsequent redirections
        // Set to false to redirect every time
        useCookie: true,
        // Cookie name
        cookieKey: 'i18n_redirected',
        // Set to always redirect to value stored in the cookie, not just once
        alwaysRedirect: false,
        // If no locale for the browsers locale is a match, use this one as a fallback
        fallbackLocale: 'en'
      } : false,
      vuex: {
        // Module namespace
        moduleName: 'i18n',
        syncLocale: true,
        syncRouteParams: true
      }
    }]
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  router: {
    extendRoutes(routes) {
      routes.push({
        name: 'slug',
        path: '/*',
        component: 'pages/index.vue'
      });
      routes.push({
        name: 'i18n_redirect',
        path: '/*',
        component: 'pages/index.vue'
      });
    }
  },

  /*
  ** Build configuration
  */
  build: {
    filenames: {
      app: ({ isDev }) => isDev ? '[name].js' : '[name].[chunkhash].js',
      chunk: ({ isDev }) => isDev ? '[name].js' : '[name].[chunkhash].js'
    },
    stats: process.env.NODE_ENV === 'test' ? 'errors-only' : {
      chunks: false,
      children: false,
      modules: false,
      colors: true,
      warnings: true,
      errors: true,
      excludeAssets: [
        /.map$/,
        /index\..+\.html$/,
        /vue-ssr-client-manifest.json/
      ]
    },
    extractCSS: true,
    publicPath: process.env.NUXT_ENV_BUILD_PUBLIC_PATH,
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      config.node = { fs: 'empty' };
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        });
      }
    }
  }
};
