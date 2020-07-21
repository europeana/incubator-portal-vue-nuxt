import config from './config';

import * as utils from './utils';

const plugin = {
  ...utils,
  config
};

export default async({ app }, inject) => {
  app.$http = plugin;
  inject('http', plugin);
};
