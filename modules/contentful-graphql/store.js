export default {
  namespaced: true,

  state: () => ({
    origin: null,
    space: null,
    environment: null,
    accessTokens: {
      delivery: null,
      preview: null
    }
  }),

  mutations: {
    configure(state, options) {
      for (const key in options) {
        state[key] = options[key];
      }
    }
  },

  getters: {
    accessToken: (state) => (preview = false) => {
      return state.accessTokens[preview ? 'preview' : 'delivery'];
    },
    endpoint(state, getters) {
      return `${getters.origin}${getters.path}`;
    },
    origin(state) {
      return state.origin || 'https://graphql.contentful.com';
    },
    path(state) {
      return `/content/v1/spaces/${state.space}/environments/${state.environment || 'master'}`;
    }
  }
};
