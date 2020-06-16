const consola = require('consola');

const express = require('express');
const morgan = require('morgan');
const timeout = require('connect-timeout');
const { Nuxt, Builder } = require('nuxt');
const app = express();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

app.use(timeout('1s'));
app.set('port', port);

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production');

const haltOnTimedout = (req, res, next) => {
  if (!req.timedout) next();
};

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config);
  await nuxt.ready();

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  if (process.env.NODE_ENV !== 'test') {
    // Use morgan for request logging
    app.use(morgan('combined'));

    // IP access retriction
    if (process.env.IP_FILTER_ALLOW) {
      consola.info(`Restricting access to IPs: ${process.env.IP_FILTER_ALLOW}`);
      const ipfilter = require('express-ipfilter').IpFilter;
      const allowIps = process.env.IP_FILTER_ALLOW.split(' ');
      let ipfilterOptions = { mode: 'allow' };
      if (process.env.IP_FILTER_TRUST_PROXY) {
        consola.info(`Trusting proxy: ${process.env.IP_FILTER_TRUST_PROXY}`);
        ipfilterOptions.trustProxy = process.env.IP_FILTER_TRUST_PROXY.split(' ');
      }
      app.use(ipfilter(allowIps, ipfilterOptions));
    }

    // HTTP Digest authentication
    if (process.env.HTTP_DIGEST_REALM && process.env.HTTP_DIGEST_ACL) {
      consola.info('HTTP Digest authentication enabled');

      const acl = JSON.parse(process.env.HTTP_DIGEST_ACL);
      const realm = process.env.HTTP_DIGEST_REALM;

      const crypto = require('crypto');
      const httpAuth = require('http-auth');

      const digest = httpAuth.digest({
        realm
      }, (username, callback) => {
        consola.info(`Authenticating username "${username}" in realm "${realm}"`);

        const credentials = acl.find((account) => {
          return account.username === username;
        }) || {};

        // Callback expects md5(username:realm:password)
        const htdigest = `${credentials.username}:${realm}:${credentials.password}`;
        let hash = crypto.createHash('MD5');
        hash.update(htdigest);

        callback(hash.digest('hex'));
      });

      app.use(httpAuth.connect(digest));
    }
  }

  // Give nuxt middleware to express
  app.use(nuxt.render);
  app.use(haltOnTimedout);

  // Listen the server
  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });
}
start();
