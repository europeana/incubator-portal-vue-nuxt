import config from './config';

import {
  currentHost, currentProtocol, httpPort, httpsPort,
  routePermittedOnEitherScheme, routeOnDatasetBlacklist
} from './utils';

export default (context, inject) => {
  const path = (route) => {
    const localePath = context.app.localePath(route);

    if (!config.sslNegotiation.enabled || routePermittedOnEitherScheme(route)) return localePath;

    const routeBlacklisted = routeOnDatasetBlacklist(route, config.sslNegotiation.datasetBlacklist);

    const protocol = currentProtocol(context);

    let switchToProtocol;
    let switchToPort;
    if (routeBlacklisted && (protocol === 'https:')) {
      switchToProtocol = 'http:';
      switchToPort = httpPort(context);
    } else if (!routeBlacklisted && (protocol === 'http:')) {
      switchToProtocol = 'https:';
      switchToPort = httpsPort(context);
    }

    if (!switchToProtocol) return localePath;

    const portlessHost = currentHost(context).split(':')[0];

    return `${switchToProtocol}//${portlessHost}${switchToPort}${localePath}`;
  };

  inject('path', path);
};
