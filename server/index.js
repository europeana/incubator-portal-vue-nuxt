const consola = require('consola');

const vcapApplication = process.env.VCAP_APPLICATION ? JSON.parse(process.env.VCAP_APPLICATION) : {};
// Remove "-new" from app name resulting from blue/green deployment
const vcapApplicationName = vcapApplication.name ? vcapApplication.name.replace(/-new$/, '') : null;

const vcapServices = require('vcap_services');
const elasticApmCredentials = vcapServices.getCredentials('user-provided', null, 'elastic-apm');

if (elasticApmCredentials.server_url) {
  consola.info(`Using Elastic APM at ${elasticApmCredentials.server_url}`);
  require('elastic-apm-node').start({
    serviceName: vcapApplicationName || 'portaljs',
    secretToken: elasticApmCredentials.secret_token,
    serverUrl: elasticApmCredentials.server_url,
    frameworkName: 'Nuxt.js',
    frameworkVersion: require('nuxt/package.json').version,
    serviceVersion: require('../package.json').version
  });
}

const express = require('express');
const morgan = require('morgan');
const { Nuxt, Builder } = require('nuxt');
const app = express();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

app.set('port', port);

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test');

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config);

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  if (process.env.NODE_ENV !== 'test') {
    // Use morgan for request logging
    app.use(morgan('combined'));
  }

  // Give nuxt middleware to express
  app.use(nuxt.render);

  // Listen the server
  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });
}
start();
