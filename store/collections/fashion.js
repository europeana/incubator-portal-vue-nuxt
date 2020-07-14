import { defaultFacetNames } from '../search';

const fashionFacetNames = [
  'CREATOR',
  'proxy_dc_format.en',
  'proxy_dcterms_medium.en',
  'proxy_dc_type.en'
].concat(defaultFacetNames);
fashionFacetNames.splice(fashionFacetNames.indexOf('contentTier'), 1);
const fashionFacetParam = fashionFacetNames.join(',');

const facetFieldLabelPatterns = {
  'CREATOR': / \(Designer\)/,
  'proxy_dc_type.en': /Object Type: /,
  'proxy_dc_format.en': /Technique: /,
  'proxy_dcterms_medium.en': /Material: /
};

export const state = () => ({
  apiParams: {},
  facets: []
});

export const getters = {
  apiParams: (state) => {
    const params = Object.assign({}, state.apiParams);
    params.facet = fashionFacetParam;
    return params;
  },

  facets: (state) => {
    return state.facets.map((facet) => {
      const labelPattern = facetFieldLabelPatterns[facet.name];
      return {
        name: facet.name,
        fields: facet.fields.filter((field) => labelPattern ? labelPattern.test(field.label) : true)
      };
    });
  },

  formatFacetFieldLabel: () => (facetName, facetFieldLabel) => {
    const labelPattern = facetFieldLabelPatterns[facetName];
    return labelPattern ? facetFieldLabel.replace(labelPattern, '') : facetFieldLabel;
  }
};

export const mutations = {
  set(state, payload) {
    state[payload[0]] = payload[1];
  }
};
