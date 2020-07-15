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
  }
};
