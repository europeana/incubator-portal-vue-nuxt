import axios from 'axios';

import queries from './queries';

import storeModule from './store';

export default ({ app, store }, inject) => {
  const origin = store.contentful.state.origin || 'https://graphql.contentful.com';
  const path = `/content/v1/spaces/${store.contentful.state.space}/environments/${store.contentful.state.environment || 'master'}`;

  const query = (alias, variables = {}) => {
    const accessToken = store.contentful.state.accessTokens[variables.preview ? 'preview' : 'delivery'];

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

  app.$contentful = plugin;
  inject('contentful', plugin);

  store.registerModule('contentful', storeModule);
};
