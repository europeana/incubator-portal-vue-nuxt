const getItems = require('../../../cachers/items/recent/get');
import { errorHandler } from '../';

export default (config = {}) => (req, res) => {
  if (!config.redis.url) {
    return errorHandler(res, new Error('No cache configured.'));
  }

  return getItems(config)
    .then(({ body }) => res.json(body))
    .catch(error => errorHandler(res, error));
};
