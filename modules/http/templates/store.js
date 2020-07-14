import { currentProtocol, currentHost } from './utils';

// TODO: with ssl/http stuff gathered into a module, do we need to store ports here?

export default {
  namespaced: true,
  state: () => ({
    protocol: null,
    path: null,
    host: null,
    httpPort: '',
    httpsPort: ''
  }),
  mutations: {
    set(state, payload) {
      state[payload[0]] = payload[1];
    }
  },
  getters: {
    canonicalUrl(state, getters) {
      return getters.origin + state.path;
    },
    canonicalUrlWithoutLocale(state, getters) {
      return getters.canonicalUrl.replace(/(:\/\/[^/]+)\/[a-z]{2}(\/|$)/, '$1$2');
    },
    origin(state) {
      return `${state.protocol}//${state.host}`;
    }
  },
  actions: {
    init({ commit }, { req, route, app }) {
      const protocol = currentProtocol({ req });
      const host = currentHost({ req });
      const path = route.fullPath;

      const httpPort = app.$http.config.ports.http ? `:${app.$http.config.ports.http}` : '';
      const httpsPort = app.$http.config.ports.https ? `:${app.$http.config.ports.https}` : '';

      commit('set', ['protocol', protocol]);
      commit('set', ['host', host]);
      commit('set', ['path', path]);
      commit('set', ['httpPort', httpPort]);
      commit('set', ['httpsPort', httpsPort]);
    }
  }
};
