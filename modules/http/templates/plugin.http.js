import config from './config';

import { currentProtocol, currentHost, isHttps, requestOrigin } from './utils';

import storeModule from './store';

const plugin = {
  config,
  currentHost,
  currentProtocol,
  isHttps,
  requestOrigin
};

export default ({ app, store }, inject) => {
  app.$http = plugin;
  inject('http', plugin);

  if (store) store.registerModule('http', storeModule);
};
