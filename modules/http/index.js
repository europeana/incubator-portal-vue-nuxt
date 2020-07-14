import path from 'path';

// TODO: come up with a better name for this module
const MODULE_NAME = 'http';

const defaults = {
  ports: {
    http: null,
    https: null
  },
  sslNegotiation: {
    enabled: false,
    datasetBlacklist: []
  }
};

const templates = ['config.ejs', 'store.js', 'utils.js'];
const plugins = ['middleware.js', 'plugin.goto.js', 'plugin.http.js', 'plugin.path.js'];

export default function(moduleOptions) {
  const config = {
    ...defaults,
    ...moduleOptions
  };

  for (const template of templates) {
    this.addTemplate({
      src: path.resolve(__dirname, path.join('templates', template)),
      fileName: path.join(MODULE_NAME, template.replace('.ejs', '.js')),
      options: config
    });
  }

  for (const plugin of plugins) {
    this.addPlugin({
      src: path.resolve(__dirname, path.join('templates', plugin)),
      fileName: path.join(MODULE_NAME, plugin),
      options: config
    });
  }

  this.options.router.middleware.push('sslNegotiation');
}
