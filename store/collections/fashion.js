import { defaultFacetNames } from '../search';

const fashionFacetNames = ['CREATOR', 'proxy_dc_format', 'proxy_dcterms_medium', 'proxy_dc_type'].concat(defaultFacetNames);
const fashionFacetParam = fashionFacetNames.join(',');

export const state = () => ({
  apiParams: {},
  enabled: false
});

export const getters = {
  apiParams: (state) => {
    const params = Object.assign({}, state.apiParams);
    params.facet = fashionFacetParam;
    return params;
  }
};

export const mutations = {
  enable(state) {
    state.enabled = true;
  },
  set(state, payload) {
    state[payload[0]] = payload[1];
  }
};
