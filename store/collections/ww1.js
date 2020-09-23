// TODO: this essentially duplicates newspapers.js, with just the default
//       for the api param different. Refactor to DRY it up.

export const state = () => ({
  apiOptions: {},
  apiParams: {}
});

export const getters = {
  apiOptions: (state, getters) => (apiConfig) => {
    const options = Object.assign({}, state.apiOptions);

    if (getters.apiParams.api === 'fulltext') {
      options.url = apiConfig.newspaper.url;
    }

    return options;
  },

  apiParams: (state) => (apiConfig) => {
    const params = Object.assign({}, state.apiParams);

    // Ensure ww1 collection gets metadata API by default
    if (!params.api) {
      params.api = 'metadata';
    }

    if (params.api === 'fulltext') {
      // TODO: fulltext search API should be aware of contentTier, but is not.
      //       If & when it is, this can be removed.
      params.qf = ([].concat(params.qf)).filter(qf => !/^contentTier:/.test(qf));
      params.qf.push('contentTier:*');

      params.wskey = apiConfig.newspaper.key;
      params.profile = 'minimal,hits';
    }

    return params;
  }
};

export const mutations = {
  set(state, payload) {
    state[payload[0]] = payload[1];
  }
};
