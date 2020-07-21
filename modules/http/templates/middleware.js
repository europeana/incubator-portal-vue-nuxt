// When Nuxt is built, ../middleware points to .nuxt/middleware.js
import middleware from '../middleware';

import config from './config';

import {
  currentHost, httpPort, httpsPort, isHttps,
  routePermittedOnEitherScheme, routeOnDatasetBlacklist
} from './utils';

const negotiate = (context) => {
  const ssl = isHttps(context);
  const routeBlacklisted = routeOnDatasetBlacklist(context.route, config.sslNegotiation.datasetBlacklist);

  let redirectToScheme;
  let redirectToPort = '';

  if (ssl && routeBlacklisted) {
    // redirect to non-ssl
    redirectToScheme = 'http';
    redirectToPort = httpPort(context);
  } else if (!ssl && !routeBlacklisted) {
    // redirect to ssl
    redirectToScheme = 'https';
    redirectToPort = httpsPort(context);
  } else {
    return;
  }

  const host = currentHost(context).split(':')[0];
  const redirectToUrl = `${redirectToScheme}://${host}${redirectToPort}${context.route.fullPath}`;

  return context.redirect(redirectToUrl);
};

middleware.sslNegotiation = async(context) => {
  if (!config.sslNegotiation.enabled || routePermittedOnEitherScheme(context.route)) return;

  return negotiate(context);
};
