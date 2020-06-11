import settings from './settings';

export default ({ app, store }, inject) => {
  if (store) {
    store.registerModule('config', {
      namespaced: true,
      state: {
        settings: {}
      },
      mutations: {
        set(state, env = {}) {
          for (const property of settings) {
            // TODO: camelcase properties?
            state.settings[property] = env[property];
          }
        }
      }
    });

    const config = () => store.state.config.settings;
    app.$config = config;
    inject('config', config);
  }
};
