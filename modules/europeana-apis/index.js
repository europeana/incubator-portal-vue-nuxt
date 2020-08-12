const path = require('path');

const MODULE_NAME = 'europeana-apis';

module.exports = async function() {
  const templates = [
    'annotation.js',
    'config.js',
    'entity.js',
    'record.js',
    'search.js',
    'set.js',
    'thumbnail.js',
    'utils.js'
  ];
  for (const template of templates) {
    this.addTemplate({
      src: path.resolve(__dirname, `templates/${template}`),
      fileName: path.join(MODULE_NAME, template)
    });
  }

  this.addPlugin({
    src: path.resolve(__dirname, 'templates/plugin.js'),
    fileName: path.join(MODULE_NAME, 'plugin.js')
  });

  // FIXME: this is broken with the switch to using Nuxt runtime config
  // this.addServerMiddleware(path.resolve(__dirname, 'server-middleware.js'));
};
