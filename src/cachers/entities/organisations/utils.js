const axios = require('axios');
const redis = require('redis');
const { promisify } = require('util');

const CACHE_KEY = '@europeana:portal.js:entity:organizations';

const redisConfig = (params = {}) => {
  const redisOptions = {
    url: params.redisUrl
  };

  if (params.redisTlsCa) {
    redisOptions.tls = {
      ca: [Buffer.from(params.redisTlsCa, 'base64')]
    };
  }

  return redisOptions;
};

const createRedisClient = (params = {}) => {
  const redisClient = redis.createClient(redisConfig(params));

  redisClient.on('error', console.error);

  for (const fn of ['del', 'get', 'set', 'hdel', 'hget', 'hgetall', 'hkeys', 'hset', 'quit']) {
    redisClient[`${fn}Async`] = promisify(redisClient[fn]).bind(redisClient);
  }

  return redisClient;
};

const axiosConfig = (params = {}) => {
  return {
    id: 'entity',
    baseURL: params.europeanaEntityApiBaseUrl || 'https://api.europeana.eu/entity',
    params: {
      wskey: params.europeanaEntityApiKey
    }
  };
};

const createAxiosClient = (params = {}) => axios.create(axiosConfig(params));

const errorMessage = (error) => {
  let message;
  if (error.response) {
    if (error.response.data.error) {
      message = error.response.data.error;
    } else {
      message = `${error.response.status} ${error.response.statusText}`;
    }
  } else {
    message = error.message;
  }
  return message;
};

module.exports = {
  CACHE_KEY,
  createAxiosClient,
  createRedisClient,
  errorMessage
};
