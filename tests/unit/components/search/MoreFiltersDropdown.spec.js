import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import sinon from 'sinon';
import MoreFacetsDropdown from '../../../../components/search/MoreFiltersDropdown.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    search: {
      namespaced: true,
      state: {
        apiParams: {}
      },
      getters: {
        collection: () => null
      }
    }
  }
});

const factory = () => shallowMount(MoreFacetsDropdown, {
  localVue,
  propsData: {
    selected: {}
  },
  stubs: ['b-button', 'b-dropdown', 'b-dropdown-form'],
  mocks: {
    $t: (key) => key
  },
  store
});

describe('components/search/MoreFacetsDropdown', () => {
  it('displays the correct count of selected options', () => {
    const wrapper = factory();

    wrapper.setProps({
      selected: {
        'LANGUAGE': ['de', 'sv'],
        'PROVIDER': ['OpenUp!']
      }
    });

    wrapper.vm.selectedOptionsCount.should.eql(3);
  });

  it('disables the cancel and apply button when nothing has been selected', () => {
    const wrapper = factory();

    wrapper.setProps({
      selected: {}
    });

    wrapper.setData({
      preSelected: {}
    });

    wrapper.vm.selectedOptionsUnchanged.should.eql(true);
  });

  it('disables the cancel and apply button when nothing new has been selected', () => {
    const wrapper = factory();

    wrapper.setProps({
      selected: {
        'LANGUAGE': ['de', 'sv'],
        'PROVIDER': ['OpenUp!']
      }
    });

    wrapper.setData({
      preSelected: {}
    });

    wrapper.vm.selectedOptionsUnchanged.should.eql(true);
  });

  it('enables the cancel and apply button when an option has been selected', () => {
    const wrapper = factory();

    wrapper.setProps({
      selected: {}
    });

    wrapper.setData({
      preSelected: {
        'LANGUAGE': ['de', 'sv']
      }
    });

    wrapper.vm.selectedOptionsUnchanged.should.eql(false);
  });

  it('maps an array of more facet names', () => {
    const wrapper = factory();

    wrapper.setProps({
      moreFacets: [
        {
          name: 'LANGUAGE',
          fields: [
            {
              count: 123,
              label: 'en'
            }
          ]
        },
        {
          name: 'PROVIDER',
          fields: [
            {
              count: 12,
              label: 'OpenUp'
            }
          ]
        }
      ]
    });

    wrapper.vm.moreFacetNames.should.eql(['LANGUAGE', 'PROVIDER']);
  });

  it('clones selected data', () => {
    const wrapper = factory();
    const selected = {
      'LANGUAGE': ['de', 'sv'],
      'PROVIDER': ['OpenUp!']
    };

    wrapper.setProps({ selected });
    wrapper.vm.preSelected.should.eql(selected);
  });

  it('clears preselected data when user clicks Cancel button', () => {
    const wrapper = factory();
    wrapper.vm.$refs.dropdown.hide = sinon.spy();
    const cancelButton = wrapper.find('[data-qa="cancel button"]');

    wrapper.setProps({
      selected: {
        'PROVIDER': ['OpenUp!']
      }
    });

    wrapper.setData({
      preSelected: {
        'LANGUAGE': ['de', 'sv']
      }
    });

    cancelButton.vm.$emit('click');

    wrapper.vm.preSelected.should.deep.eql({ 'PROVIDER': ['OpenUp!'] });
  });

  it('clears all preselected data when user clicks the Reset Filter button', () => {
    const wrapper = factory();

    wrapper.setData({
      preSelected: {
        'LANGUAGE': ['de', 'sv']
      }
    });

    wrapper.vm.clearPreSelected();

    wrapper.vm.preSelected.should.eql({ LANGUAGE: [] });
  });

  describe('dateFilterSelected()', () => {
    it('populates preSelected with `start` and `end` dates when user uses date filter', () => {
      const wrapper = factory();
      const facetName = 'proxy_dcterms_issued';
      const dateRange = { end: null, start: '2019-12-07' };

      wrapper.vm.dateFilterSelected(facetName, dateRange);

      wrapper.vm.preSelected.should.eql({
        'proxy_dcterms_issued': ['[2019-12-07 TO *]']
      });
    });
  });

  describe('dateFilter computed property', () => {
    it('returns empty `end` and `start` properties when `proxy_dcterms_issued` doesn`t exist in preSelected', () => {
      const wrapper = factory();

      wrapper.vm.dateFilter.should.eql({
        end: null,
        specific: false,
        start: null
      });
    });

    it('returns correct `end` and `start` properties if preSelected contains `proxy_dcterms_issued`', () => {
      const wrapper = factory();

      wrapper.setData({
        preSelected: {
          'proxy_dcterms_issued': ['[2019-12-06 TO *]']
        }
      });

      wrapper.vm.dateFilter.should.eql({
        end: null,
        start: '2019-12-06'
      });
    });
  });

  describe('filtersChanged computed property', () => {
    const wrapper = factory();

    it('detects filters that have been added', () => {
      wrapper.setProps({
        selected: {
          'LANGUAGE': ['de']
        }
      });
      wrapper.setData({
        preSelected: {
          'LANGUAGE': ['de', 'fr'],
          'IMAGE_SIZE': ['MEDIUM']
        }
      });

      wrapper.vm.filtersChanged.should.eql(['LANGUAGE', 'IMAGE_SIZE']);
    });

    it('detects filters that have been removed', () => {
      wrapper.setProps({
        selected: {
          'LANGUAGE': ['de']
        }
      });
      wrapper.setData({
        preSelected: {
          'LANGUAGE': []
        }
      });

      wrapper.vm.filtersChanged.should.eql(['LANGUAGE']);
    });

    it('detects filters that are unchanged', () => {
      wrapper.setProps({
        selected: {
          'LANGUAGE': ['de']
        }
      });
      wrapper.setData({
        preSelected: {
          'LANGUAGE': ['de'],
          'IMAGE_SIZE': []
        }
      });

      wrapper.vm.filtersChanged.should.eql([]);
    });
  });
});
