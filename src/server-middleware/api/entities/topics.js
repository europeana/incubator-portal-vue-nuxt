const { CACHE_KEY } = require('../../../cachers/entities/topics');
const { createRedisClient } = require('../../../cachers/utils');
import { errorHandler } from '../';

const subsetSize = 4;

const offsetOfTheDay = (setSize) => {
  const millisecondsPerDay = (1000 * 60 * 60 * 24);
  const unixDay = Math.floor(Date.now() / millisecondsPerDay);

  return (unixDay * subsetSize) % setSize;
};

export const topicsOfTheDay = (config = {}) => {
  const redisClient = createRedisClient(config);

  return redisClient.getAsync(CACHE_KEY)
    .then(value => JSON.parse(value))
    .then(parsed => {
      const offset = offsetOfTheDay(parsed.length);
      return parsed.slice(offset, offset + subsetSize);
    });
};

export default (config = {}) => (req, res) => {
  if (!config.redis.url) {
    return errorHandler(res, new Error('No cache configured.'));
  }

  return topicsOfTheDay(config)
    .then(topics => res.json(topics))
    .catch(error => errorHandler(res, error));
};
