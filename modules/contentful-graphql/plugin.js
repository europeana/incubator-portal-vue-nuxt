import axios from 'axios';

import queries from './queries';

const origin = process.env['CTF_GRAPHQL_ORIGIN'] || 'https://graphql.contentful.com';
const path = `/content/v1/spaces/${process.env['CTF_SPACE_ID'] || 'master'}/environments/${process.env['CTF_ENVIRONMENT_ID']}`;

const query = (alias, variables = {}) => {
  const accessToken = variables.preview ? process.env['CTF_CPA_ACCESS_TOKEN'] : process.env['CTF_CDA_ACCESS_TOKEN'];

  const url = `${origin}${path}`;

  const body = {
    query: queries[alias],
    variables
  };

  const headers = {
    'Authorization': `Bearer ${accessToken}`
  };

  // These params will go into the URL query which will not be used by the
  // GraphQL service itself as it's a POST request, but facilitate intermediary
  // caching based on the URL alone, as with the apicache module.
  const params = {
    _query: alias,
    ...variables
  };

  return axios.post(url, body, { headers, params });
};

const plugin = {
  query
};

export default ({ app }, inject) => {
  app.$contentful = plugin;
  inject('contentful', plugin);
};
