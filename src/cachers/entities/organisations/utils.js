const axios = require('axios');

const CACHE_KEY = '@europeana:portal.js:entities:organisations';

const axiosConfig = (config = {}) => {
  return {
    baseURL: config.europeana.apis.entity.url || 'https://api.europeana.eu/entity',
    params: {
      wskey: config.europeana.apis.entity.key
    }
  };
};

const createAxiosClient = (config = {}) => axios.create(axiosConfig(config));

module.exports = {
  CACHE_KEY,
  createAxiosClient
};
