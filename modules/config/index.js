const path = require('path');
const MODULE_NAME = 'config';

module.exports = function(moduleOptions) {
  this.addTemplate({
    src: path.resolve(__dirname, 'settings.ejs'),
    fileName: path.join(MODULE_NAME, 'settings.js'),
    options: moduleOptions.settings || []
  });

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: path.join(MODULE_NAME, 'plugin.js')
  });
};
