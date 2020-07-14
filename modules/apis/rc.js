const { cosmiconfigSync } = require('cosmiconfig');
const merge = require('deepmerge');

const defaults = require('./defaults');

const loadRuntimeConfiguration = () => {
  let rc = {};

  if (process.env['EUROPEANA_APIS']) {
    rc = JSON.parse(process.env['EUROPEANA_APIS']);
  } else {
    const configSearch = cosmiconfigSync('apis').search();
    if (configSearch) rc = configSearch.config;
  }

  return rc;
};

const generateMultiOriginConfiguration = () => {
  const rc = loadRuntimeConfiguration();

  const options = { defaults: merge(defaults, rc.defaults || {}) };

  for (const origin in rc) {
    if (origin !== 'defaults') {
      options[origin] = {};
      for (const api in options.defaults) {
        options[origin][api] = merge(options.defaults[api], rc[origin][api] || {});
      }
    }
  }

  return options;
};

module.exports = generateMultiOriginConfiguration();
