import path from 'path';
import elasticApmNode from 'elastic-apm-node';

const MODULE_NAME = 'elastic-apm';

export default function(moduleOptions) {
  if (!moduleOptions.serverUrl) return;

  elasticApmNode.start(moduleOptions);

  this.addTemplate({
    src: path.resolve(__dirname, path.join('templates', 'options.ejs')),
    fileName: path.join(MODULE_NAME, 'options.js'),
    options: moduleOptions
  });

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: path.join(MODULE_NAME, 'plugin.js'),
    mode: 'client'
  });
}
