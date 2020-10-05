import { diff } from 'deep-object-diff';
import merge from 'deepmerge';
import { search, unquotableFacets } from '../plugins/europeana/search';

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
  'MIME_TYPE',
  'contentTier'
];

const filtersFromQf = (qfs) => {
  const filters = {};

  for (const qf of [].concat(qfs || [])) {
    const qfParts = qf.split(':');
    const name = qfParts[0];
    const value = qfParts.slice(1).join(':');
    if (typeof filters[name] === 'undefined') {
      filters[name] = [];
    }
    filters[name].push(value);
  }

  return filters;
};

export const queryUpdatesForFilters = (filters) => {
  const queryUpdates = {
    qf: [],
    page: 1
  };

  for (const name in filters) {
    switch (name) {
      case 'REUSABILITY':
        // `reusability` has its own API parameter and can not be queried in `qf`
        queryUpdates.reusability = filters[name].length > 0 ? filters[name].join(',') : null;
        break;
      case 'api':
        // `api` is an option to /plugins/europeana/search/search()
        queryUpdates.api = filters[name];
        break;
      default:
        // Everything else goes in `qf`
        queryUpdates.qf = queryUpdates.qf.concat(queryUpdatesForFilter(name, filters[name]));
    }
  }
  return queryUpdates;
};

export const queryUpdatesForFilter = (name, values) => {
  return [].concat(values)
    .filter((value) => (value !== undefined) && (value !== null))
    .map((value) => `${name}:${value}`);
};

export const state = () => ({
  active: false,
  apiOptions: {},
  apiParams: {},
  autoSuggestEnabled: true,
  collectionFacetEnabled: true,
  error: null,
  errorStatusCode: null,
  facets: [],
  hits: null,
  lastAvailablePage: null,
  overrideParams: {},
  pill: null,
  previousApiOptions: null,
  previousApiParams: null,
  resettableFilters: [],
  results: [],
  totalResults: null,
  userParams: {},
  view: null
});

export const mutations = {
  clearResettableFilters(state) {
    state.resettableFilters = [];
  },
  addResettableFilter(state, filterName) {
    if (!state.resettableFilters.includes(filterName)) state.resettableFilters.push(filterName);
  },
  removeResettableFilter(state, filterName) {
    const index = state.resettableFilters.indexOf(filterName);
    if (index !== -1) state.resettableFilters.splice(index, 1);
  },
  disableAutoSuggest(state) {
    state.autoSuggestEnabled = false;
  },
  enableAutoSuggest(state) {
    state.autoSuggestEnabled = true;
  },
  disableCollectionFacet(state) {
    state.collectionFacetEnabled = false;
  },
  enableCollectionFacet(state) {
    state.collectionFacetEnabled = true;
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
    if (!value) value = [];
    for (const facet of value) {
      if (facet.name === 'REUSABILITY') {
        facet.fields = facet.fields.filter((field) => field.label !== 'uncategorized');
      }

      if (!unquotableFacets.includes(facet.name)) {
        for (const field of facet.fields) {
          field.label = `"${field.label}"`;
        }
      }
    }
    state.facets = value;
  },
  setHits(state, value) {
    state.hits = value;
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
  },
  set(state, payload) {
    state[payload[0]] = payload[1];
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

  formatFacetFieldLabel: (state, getters, rootState, rootGetters) => (facetName, facetFieldLabel) => {
    const collection = getters.collection;
    if (!getters.hasCollectionSpecificSettings(collection)) return;
    if (!rootGetters[`collections/${collection}/formatFacetFieldLabel`]) return;

    return rootGetters[`collections/${collection}/formatFacetFieldLabel`](facetName, facetFieldLabel);
  },

  facetNames(state) {
    return (state.apiParams.facet || '').split(',');
  },

  hasCollectionSpecificSettings: (state, getters, rootState) => (collection) => {
    return (!!collection) &&
      (!!rootState.collections && !!rootState.collections[collection]) &&
      ((rootState.collections[collection].enabled === undefined) || rootState.collections[collection].enabled);
  },

  hasResettableFilters(state) {
    return state.resettableFilters.length > 0;
  },

  collection(state) {
    const collectionFilter = filtersFromQf(state.apiParams.qf).collection;
    return collectionFilter ? collectionFilter[0] : null;
  },

  queryUpdatesForFacetChanges: (state, getters) => (selected = {}) => {
    const filters = Object.assign({}, getters.filters);

    for (const name in selected) {
      filters[name] = selected[name];
    }

    // Remove collection-specific filters when collection is changed
    if (Object.prototype.hasOwnProperty.call(selected, 'collection') || !getters.collection) {
      for (const name in filters) {
        if (name !== 'collection' && !defaultFacetNames.includes(name) && state.resettableFilters.includes(name)) {
          filters[name] = [];
        }
      }
    }

    // Remove filters incompatible with collection filter
    if (Object.prototype.hasOwnProperty.call(selected, 'collection') && Object.prototype.hasOwnProperty.call(filters, 'contentTier')) {
      filters['contentTier'] = [];
    }

    return queryUpdatesForFilters(filters);
  },

  // TODO: do not assume filters are fielded, e.g. `qf=whale`
  filters: (state) => {
    const filters = filtersFromQf(state.userParams.qf);

    if (state.userParams.reusability) {
      filters['REUSABILITY'] = state.userParams.reusability.split(',');
    }

    if (state.apiParams.api) {
      filters['api'] = state.apiParams.api;
    }

    return filters;
  },

  apiParamsChanged: (state) => {
    return Object.keys(diff(state.previousApiParams, state.apiParams));
  },

  itemUpdateNeeded: (state, getters) => {
    if (!state.previousApiParams) return true; // i.e. if this is the first search
    return getters.apiParamsChanged
      .some((param) => ['page', 'query', 'qf', 'api', 'reusability'].includes(param));
  },

  facetUpdateNeeded: (state, getters) => {
    if (!state.previousApiParams) return true; // i.e. if this is the first search
    return getters.apiParamsChanged
      .some((param) => ['query', 'qf', 'api', 'reusability'].includes(param));
  },

  searchOptions: (state) => {
    const escape = (!state.userParams.query && !!state.overrideParams.query);

    return { ...state.apiOptions, escape };
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
    commit('set', ['userParams', {}]);
    commit('set', ['overrideParams', {}]);
    commit('set', ['apiParams', {}]);
    commit('set', ['apiOptions', {}]);
    commit('set', ['previousApiParams', null]);
    commit('set', ['previousApiOptions', null]);
    commit('setPill', null);
  },

  // TODO: replace with a getter?
  async deriveApiSettings({ commit, dispatch, state, getters, rootGetters }) {
    // Coerce qf from user input into an array as it may be a single string

    const userParams = Object.assign({}, state.userParams || {});
    userParams.qf = [].concat(userParams.qf || []);

    const apiParams = merge(userParams, state.overrideParams || {});
    if (!apiParams.facet) {
      apiParams.facet = defaultFacetNames.join(',');
    }

    if (!apiParams.profile) apiParams.profile = 'minimal';

    const apiOptions = {};
    if (apiParams.recordApi) {
      apiOptions.origin = apiParams.recordApi;
      delete apiParams.recordApi;
    }

    commit('set', ['previousApiParams', Object.assign({}, state.apiParams)]);
    commit('set', ['previousApiOptions', Object.assign({}, state.apiOptions)]);

    commit('set', ['apiParams', apiParams]);
    commit('set', ['apiOptions', apiOptions]);

    if (getters.collection || rootGetters['entity/id']) {
      await dispatch('applyAnyCollectionSettings');
      await dispatch('applyCollectionSpecificSettings');
    }
  },

  applyAnyCollectionSettings({ commit, state }) {
    const facet = state.apiParams.facet.split(',');
    facet.splice(facet.indexOf('contentTier'), 1);
    commit('set', ['apiParams', { ...state.apiParams, ...{ facet: facet.join(',') } }]);
  },

  applyCollectionSpecificSettings({ commit, getters, rootGetters, rootState, state }) {
    const collection = getters.collection;
    if (!getters.hasCollectionSpecificSettings(collection)) return;

    for (const property of ['apiParams', 'apiOptions']) {
      if (rootState.collections[collection][property] !== undefined) {
        commit(`collections/${collection}/set`, [property, state[property]], { root: true });
        commit('set', [property, rootGetters[`collections/${collection}/${property}`]]);
      }
    }
  },

  /**
   * Run a Record API search and store the results
   */
  async run({ dispatch, getters }) {
    await dispatch('deriveApiSettings');

    await Promise.all([
      getters.itemUpdateNeeded ? dispatch('queryItems') : () => null,
      getters.facetUpdateNeeded ? dispatch('queryFacets') : () => null
    ]);
  },

  queryItems({ dispatch, state, getters }) {
    const paramsForItems = {
      ...state.apiParams,
      facet: null
    };

    return search(paramsForItems, getters.searchOptions)
      .then(async(response) => {
        await dispatch('updateForSuccess', response);
      })
      .catch(async(error) => {
        await dispatch('updateForFailure', error);
      });
  },

  queryFacets({ commit, getters, rootState, rootGetters, dispatch, state }) {
    if (!state.active) return;

    const paramsForFacets = {
      ...state.apiParams,
      rows: 0,
      profile: 'facets'
    };

    return search(paramsForFacets, getters.searchOptions)
      .then((response) => {
        commit('setFacets', response.facets);
        const collection = getters.collection;

        if (getters.hasCollectionSpecificSettings(collection) && rootState.collections[collection]['facets'] !== undefined) {
          commit(`collections/${collection}/set`, ['facets', state.facets], { root: true });
          commit('set', ['facets', rootGetters[`collections/${collection}/facets`]]);
        }
      })
      .catch(async(error) => {
        await dispatch('updateForFailure', error);
      });
  },

  updateForSuccess({ commit }, response) {
    commit('setError', response.error);
    commit('setErrorStatusCode', null);
    commit('setHits', response.hits);
    commit('setLastAvailablePage', response.lastAvailablePage);
    commit('setResults', response.items);
    commit('setTotalResults', response.totalResults);
  },

  updateForFailure({ commit }, error) {
    commit('setError', error.message);
    commit('setErrorStatusCode', (typeof error.statusCode === 'undefined') ? 500 : error.statusCode);
    commit('setFacets', []);
    commit('setHits', null);
    commit('setLastAvailablePage', null);
    commit('setResults', []);
    commit('setTotalResults', null);
  },

  async setResettableFilter({ commit }, { name, selected }) {
    if ((Array.isArray(selected) && selected.length === 0) || !selected) {
      await commit('removeResettableFilter', name);
    } else {
      await commit('addResettableFilter', name);
    }
  }
};
