const { CACHE_KEY } = require('./utils');
const { createRedisClient, errorMessage } = require('../../utils');

const main = (config = {}) => {
  try {
    const redisClient = createRedisClient(config);
    return redisClient.getAsync(CACHE_KEY)
      .then(organisations => redisClient.quitAsync()
        .then(() => ({ body: JSON.parse(organisations) || {} })));
  } catch (error) {
    return Promise.reject({ statusCode: 500, body: errorMessage(error) });
  }
};

module.exports = main;
