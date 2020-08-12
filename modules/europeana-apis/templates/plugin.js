import config from './config';

import annotation from './annotation';
import entity from './entity';
import record from './record';
import search from './search';
import set from './set';
import thumbnail from './thumbnail';
import utils from './utils';

const plugin = {
  annotation,
  config,
  entity,
  record,
  search,
  set,
  thumbnail,
  utils
};

export default ({ store }, inject) => {
  inject('apis', plugin);

  if (store) {
    store.registerModule('apis', {
      namespaced: true,

      state() {
        return {
          config,
          recordApiUrl: null
        };
      },

      mutations: {
        setRecordApiUrl: (state, value) => {
          state.recordApiUrl = value;
        }
      },

      actions: {
        serverInit({ commit }, { req }) {
          commit('setRecordApiUrl', req.headers['x-europeana-record-api-url']);
        }
      }
    });
  }
};
