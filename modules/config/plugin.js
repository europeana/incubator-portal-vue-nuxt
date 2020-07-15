import settingsWhitelist from './settings';

export default ({ app, store }, inject) => {
  if (store) {
    store.registerModule('config', {
      namespaced: true,
      state: {
        settings: {}
      },

      mutations: {
        set(state, env = {}) {
          for (const property of settingsWhitelist) {
            let value = env[property];
            // typecast feature toggles
            if (property.startsWith('ENABLE_') || property.startsWith('DISABLE_')) {
              value = Boolean(Number(value));
            }
            state.settings[property] = value;
          }
        }
      }
    });

    const config = () => store.state.config.settings;
    app.$config = config;
    inject('config', config);
  }
};
