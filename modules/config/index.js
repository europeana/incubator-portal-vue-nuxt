const path = require('path');
const MODULE_NAME = 'config';

module.exports = function() {
  this.addTemplate({
    src: path.resolve(__dirname, 'settings.js'),
    fileName: path.join(MODULE_NAME, 'settings.js')
  });

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: path.join(MODULE_NAME, 'plugin.js')
  });
};
