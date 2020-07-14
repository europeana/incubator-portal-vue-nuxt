const path = require('path');

const { MODULE_NAME } = require('./constants');

const rc = require('./rc');

module.exports = async function() {
  this.addTemplate({
    src: path.resolve(__dirname, 'rc.js'),
    fileName: path.join(MODULE_NAME, 'rc.js')
  });

  this.addTemplate({
    src: path.resolve(__dirname, path.join('templates', 'config.ejs')),
    fileName: path.join(MODULE_NAME, 'config.js'),
    options: rc
  });

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: path.join(MODULE_NAME, 'plugin.js')
  });

  this.addServerMiddleware(path.resolve(__dirname, 'server-middleware.js'));
};
