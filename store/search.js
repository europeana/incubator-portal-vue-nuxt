import merge from 'deepmerge';
import search from '../plugins/europeana/search';

// Default facets to always request and display.
// Order is significant as it will be reflected on search results.
export const defaultFacetNames = [
  'TYPE',
  'REUSABILITY',
  'COUNTRY',
  'LANGUAGE',
  'PROVIDER',
  'DATA_PROVIDER',
  'COLOURPALETTE',
  'IMAGE_ASPECTRATIO',
  'IMAGE_SIZE',
  'MIME_TYPE'
];

export const state = () => ({
  active: false,
  apiOptions: {},
  apiParams: {},
  error: null,
  errorStatusCode: null,
  facets: [],
  filters: {},
  lastAvailablePage: null,
  overrideParams: {},
  pill: null,
  results: [],
  themeFacetEnabled: true,
  totalResults: null,
  userParams: {},
  view: null
});

export const mutations = {
  setUserParams(state, value) {
    state.userParams = value;
  },
  setOverrideParams(state, value) {
    state.overrideParams = value;
  },
  setApiOptions(state, value) {
    state.apiOptions = value;
  },
  setApiParams(state, value) {
    state.apiParams = value;
  },
  disableThemeFacet(state) {
    state.themeFacetEnabled = false;
  },
  enableThemeFacet(state) {
    state.themeFacetEnabled = true;
  },
  setActive(state, value) {
    state.active = value;
  },
  setError(state, value) {
    state.error = value;
  },
  setErrorStatusCode(state, value) {
    state.errorStatusCode = value;
  },
  setFacets(state, value) {
    state.facets = value;
  },
  setLastAvailablePage(state, value) {
    state.lastAvailablePage = value;
  },
  setResults(state, value) {
    state.results = value;
  },
  setTotalResults(state, value) {
    state.totalResults = value;
  },
  setView(state, value) {
    state.view = value;
    if (process.browser) {
      sessionStorage.searchResultsView = value;
      localStorage.searchResultsView = value;
    }
  },
  setPill(state, value) {
    state.pill = value;
  }
};

export const getters = {
  activeView(state) {
    if (state.view) {
      return state.view;
    } else if (process.browser) {
      if (sessionStorage.searchResultsView) {
        return sessionStorage.searchResultsView;
      } else if (localStorage.searchResultsView) {
        return localStorage.searchResultsView;
      }
    }
    return 'grid';
  },

  facetNames(state) {
    return (state.apiParams.facet || '').split(',');
  },

  hasCollectionSpecificSettings: (state, getters, rootState) => (theme) => {
    return theme &&
      rootState.collections[theme] &&
      ((rootState.collections[theme].enabled === undefined) || rootState.collections[theme].enabled);
  }
};

export const actions = {
  activate({ commit }) {
    commit('setActive', true);
  },

  async deactivate({ commit, dispatch }) {
    commit('setActive', false);
    await dispatch('reset');
  },

  reset({ commit }) {
    commit('setApiOptions', {});
    commit('setUserParams', {});
    commit('setOverrideParams', {});
    commit('setPill', null);
  },

  async deriveApiSettings({ commit, dispatch, state }) {
    // Coerce qf from user input into an array as it may be a single string
    const userParams = Object.assign({}, state.userParams || {});
    userParams.qf = [].concat(userParams.qf || []);

    const apiParams = merge(userParams, state.overrideParams || {});
    if (!apiParams.facet) {
      apiParams.facet = defaultFacetNames.join(',');
    }
    if (!apiParams.profile) {
      apiParams.profile = 'minimal,facets';
    }

    commit('setApiParams', apiParams);
    commit('setApiOptions', {});

    await dispatch('applyCollectionSpecificSettings');
  },

  applyCollectionSpecificSettings({ commit, getters, rootGetters, rootState, state }) {
    const theme = state.apiParams.theme;
    if (!getters.hasCollectionSpecificSettings(theme)) return;

    if (rootState.collections[theme].baseParams !== undefined) {
      commit(`collections/${theme}/setBaseParams`, state.apiParams, { root: true });
      commit('setApiParams', rootGetters[`collections/${theme}/apiParams`]);
    }

    if (rootState.collections[theme].baseOptions !== undefined) {
      commit(`collections/${theme}/setBaseOptions`, state.apiOptions, { root: true });
      commit('setApiOptions', rootGetters[`collections/${theme}/apiOptions`]);
    }
  },

  /**
   * Run a Record API search and store the results
   */
  async run({ dispatch, state }) {
    await dispatch('deriveApiSettings');

    await search(state.apiParams || {}, state.apiOptions || {})
      .then((response) => dispatch('updateForSuccess', response))
      .catch((error) => dispatch('updateForFailure', error));
  },

  updateForSuccess({ commit }, response) {
    commit('setError', response.error);
    commit('setErrorStatusCode', null);
    commit('setFacets', response.facets);
    commit('setLastAvailablePage', response.lastAvailablePage);
    commit('setResults', response.results);
    commit('setTotalResults', response.totalResults);
  },

  updateForFailure({ commit }, error) {
    commit('setError', error.message);
    commit('setErrorStatusCode', (typeof error.statusCode !== 'undefined') ? error.statusCode : 500);
    commit('setFacets', []);
    commit('setLastAvailablePage', null);
    commit('setResults', []);
    commit('setTotalResults', null);
  }
};
