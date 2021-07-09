const getOrganisations = require('../../../cachers/entities/organisations/get');
import { errorHandler } from '../';

export default (config = {}) => (req, res) => {
  if (!config.redis.url) {
    return errorHandler(res, new Error('No cache configured for organisations.'));
  }

  return getOrganisations(config)
    .then(({ body }) => res.json(body))
    .catch(error => errorHandler(res, error));
};
