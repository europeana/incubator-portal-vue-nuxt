export const canonicalUrl = (context) => {
  return origin(context) + context.route.fullPath;
};

export const canonicalUrlWithoutLocale = (context) => {
  return canonicalUrl(context).replace(/(:\/\/[^/]+)\/[a-z]{2}(\/|$)/, '$1$2');
};

export const origin = (context) => {
  return requestOrigin(context);
};

export const isHttps = ({ req }) => {
  if (process.client) {
    return (window.location.protocol === 'https:');
  }

  // Custom, non-standard header set by our gateway because gorouter on IBM
  // Cloud overwrites x-forwarded-proto
  if (req.headers['x-forwarded-protocol']) return req.headers['x-forwarded-protocol'] === 'https';

  if (req.headers['x-forwarded-proto']) return !req.headers['x-forwarded-proto'].split(',').includes('http');

  if (req.connection.encrypted === true) return true;

  if (req.protocol === 'https') return true;

  return false;
};

export const httpPort = (context) => {
  return context.app.$http.config.ports.http ? `:${context.app.$http.config.ports.http}` : '';
};

export const httpsPort = (context) => {
  return context.app.$http.config.ports.https ? `:${context.app.$http.config.ports.https}` : '';
};

export const currentHost = ({ req }) => {
  if (process.client) {
    return window.location.host;
  }
  return req.headers['x-forwarded-host'] || req.headers.host;
};

export const currentProtocol = ({ req }) => {
  return isHttps({ req }) ? 'https:' : 'http:';
};

export const requestOrigin = (req) => {
  return currentProtocol({ req }) + '//' + currentHost({ req });
};

export const routeOnDatasetBlacklist = (route, datasetBlacklist) => {
  if (datasetBlacklist.length === 0) return false;
  if (typeof route !== 'object' || !route) return false;
  if (!/^item-all(___[a-z]{2})?$/.test(route.name)) return false;

  const dataset = route.params.pathMatch.split('/')[0];

  const datasetBlacklistRegExp = new RegExp(`^(${datasetBlacklist.join('|')})$`);
  return datasetBlacklistRegExp.test(dataset);
};

export const routePermittedOnEitherScheme = route => {
  if (typeof route !== 'object' || !route) return false;
  return /^iiif(___[a-z]{2})?$/.test(route.name);
};
