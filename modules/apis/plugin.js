import config from './config';

export default ({ app, store }, inject) => {
  app.$apis = config;
  inject('apis', config);

  if (store) {
    store.registerModule('apis', {
      namespaced: true,
      state: {
        configs: config,
        origin: null
      },
      mutations: {
        setOrigin: (state, value) => {
          state.origin = value;
        }
      },
      getters: {
        config: (state) => {
          return state.configs[state.origin] || state.configs.defaults;
        }
      }
    });
  }
};
