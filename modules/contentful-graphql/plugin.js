import axios from 'axios';

import queries from './queries';

import storeModule from './store';

export default ({ app, store }, inject) => {
  const query = (alias, variables = {}) => {
    const accessToken = store.getters['contentful/accessToken'](variables.preview);

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

    return axios.post(store.getters['contentful/endpoint'], body, { headers, params });
  };

  const plugin = {
    query
  };

  app.$contentful = plugin;
  inject('contentful', plugin);

  store.registerModule('contentful', storeModule);
};
