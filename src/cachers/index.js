if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const defu = require('defu');
const utils = require('./utils');
const nuxtConfig = require('../../nuxt.config');
const runtimeConfig = defu(nuxtConfig.privateRuntimeConfig, nuxtConfig.publicRuntimeConfig);

const cachers = [
  'entities:organisations',
  'entities:topics',
  'items:recent'
];

const cli = cachers.reduce((memo, command) => {
  const commandPath = command.replace(/:/g, '/');
  // TODO: lazy-require just the script for command called
  memo[command] = require(`./${commandPath}`);
  return memo;
}, {});

const main = () => {
  const cacher = process.argv[2];
  const command = process.argv[3];

  let executor;

  switch (command) {
    case 'set':
      executor = cli[cacher].cache(runtimeConfig);
      break;
    case 'get':
      executor = readCacheKey(cli[cacher].CACHE_KEY);
      break;
    default:
      console.error(`Unknown command "${command}"`);
      process.exit(1);
      break;
  }

  return executor;
};

const readCacheKey = (cacheKey) => {
  try {
    const redisClient = utils.createRedisClient(runtimeConfig);
    return redisClient.getAsync(cacheKey)
      .then(data => redisClient.quitAsync()
        .then(() => ({ body: JSON.parse(data) || {} })));
  } catch (error) {
    return Promise.reject({ statusCode: 500, body: utils.errorMessage(error) });
  }
};

main()
  .then(({ body }) => {
    if (typeof body === 'string') {
      console.log(`SUCCESS: ${body}`);
    } else {
      console.log('SUCCESS:');
      console.log(JSON.stringify(body, null, 2));
    }
    process.exit(0);
  })
  .catch(({ body }) => {
    console.log(`ERROR: ${body}`);
    process.exit(1);
  });
