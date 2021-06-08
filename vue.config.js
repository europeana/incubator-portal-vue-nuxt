// Workarounds for test coverage of Vue files with Istanbul.
//
// Presumes the application of a patch to istanbul-lib-source-maps by
// tests/unit/patch-istanbul-lib-source-maps.js
//
// Courtesy of: https://gist.github.com/lsapan/3bfd0ffc0fb3d4a036fce84f6eea142e
// See: https://github.com/istanbuljs/istanbuljs/issues/464

module.exports = {
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'test') {
      config.devtool('cheap-module-eval-source-map');
      config.module.rule('js')
        .test(/\.js$/)
        .use('istanbul-instrumenter-loader')
        .loader('istanbul-instrumenter-loader')
        .before('babel-loader')
        .options({
          esModules: true
        });
    }
  }
};
