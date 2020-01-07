import search, { filtersFromQuery } from '../plugins/europeana/search';

export const state = () => ({
  active: false,
  api: 'metadata',
  autoSuggestDisabled: false,
  error: null,
  errorStatusCode: null,
  facets: [],
  filters: {},
  lastAvailablePage: null,
  page: 1,
  pill: null,
  qf: [],
  query: '',
  results: [],
  reusability: null,
  theme: null,
  themeFacetEnabled: true,
  totalResults: null,
  view: null
});

export const mutations = {
  disableThemeFacet(state) {
    state.themeFacetEnabled = false;
  },
  enableThemeFacet(state) {
    state.themeFacetEnabled = true;
  },
  setActive(state, value) {
    state.active = value;
  },
  setApi(state, value) {
    state.api = value;
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
  setFilters(state, value) {
    state.filters = value;
  },
  setLastAvailablePage(state, value) {
    state.lastAvailablePage = value;
  },
  setPage(state, value) {
    state.page = Number(value);
  },
  setQf(state, value) {
    state.qf = value;
  },
  setQuery(state, value) {
    state.query = value;
  },
  setResults(state, value) {
    state.results = value;
  },
  setReusability(state, value) {
    state.reusability = value;
  },
  setTheme(state, value) {
    state.theme = value;
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
  },
  setAutoSuggestDisable(state, value) {
    state.autoSuggestDisabled = value;
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
  }
};

export const actions = {
  /**
   * Run a Record API search and store the results
   * @param {Object} commit commit from Vuex context
   * @param {Object} dispatch dispatch from Vuex context
   * @param {Object} params parameters for search
   */
  async run({ commit, dispatch }, queryParams) {
    const params = Object.assign({ wskey: process.env.EUROPEANA_API_KEY }, queryParams);
    const hiddenParams = params.hidden || {};
    delete params.hidden;

    const options = {};

    commit('setPage', params.page || 1);
    commit('setQf', params.qf);
    commit('setQuery', params.query);
    commit('setReusability', params.reusability);
    commit('setTheme', params.theme);
    commit('setFilters', filtersFromQuery(params));
    commit('setApi', params.api);

    params.qf = (hiddenParams.qf || []).concat(params.qf || []);
    if (hiddenParams.theme) {
      params.theme = hiddenParams.theme;
    }

    if (params.api) {
      if (params.api === 'fulltext') {
        options.origin = 'https://newspapers.eanadev.org';
      }
      delete params.api;
    }

    await search(params, options)
      .then((response) => {
        dispatch('updateForSuccess', response);
      })
      .catch((error) => {
        dispatch('updateForFailure', error);
      });
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
