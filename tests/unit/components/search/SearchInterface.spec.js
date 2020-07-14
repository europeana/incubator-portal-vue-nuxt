import { createLocalVue, shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import sinon from 'sinon';

import SearchInterface from '../../../../components/search/SearchInterface.vue';
import { defaultFacetNames } from '../../../../store/search';

const localVue = createLocalVue();
localVue.filter('localise', (number) => number);
localVue.filter('truncate', (string) => string);
localVue.filter('optimisedImageUrl', (string) => string);
localVue.use(BootstrapVue);
localVue.use(VueRouter);
localVue.use(Vuex);

const searchSetViewMutation = sinon.spy();

const factory = (options = {}) => {
  const router = new VueRouter({
    routes: [
      {
        path: '/search',
        name: 'search'
      },
      {
        path: '/item/*',
        name: 'item-all'
      }
    ]
  });

  const mocks = {
    $t: (key) => key,
    $path: () => '/',
    $goto: () => null,
    ...options.mocks
  };
  const store = new Vuex.Store({
    modules: {
      search: {
        namespaced: true,
        state: {
          facets: [],
          userParams: {},
          apiParams: {},
          results: [],
          collectionFacetEnabled: true,
          resettableFilters: [],
          ...options.storeState
        },
        getters: {
          facetNames() {
            return defaultFacetNames;
          },
          filters: () => {
            return {};
          },
          collection: () => null,
          queryUpdatesForFacetChanges: () => () => {
            return {};
          },
          ...options.storeGetters
        },
        mutations: {
          setUserParams: () => null,
          setView: (state, view) => searchSetViewMutation(state, view)
        },
        actions: {
          queryFacets: () => null,
          run: () => null
        }
      }
    }
  });
  return shallowMount(SearchInterface, {
    localVue,
    mocks,
    router,
    store,
    propsData: options.propsData
  });
};

describe('components/search/SearchInterface', () => {
  describe('output', () => {
    context('with `error` in search state', () => {
      it('displays the message', () => {
        const errorMessage = 'Something went very wrong';
        const wrapper = factory({
          storeState: {
            error: errorMessage
          }
        });

        const errorNotice = wrapper.find(`[error="${errorMessage}"]`);

        errorNotice.should.exist;
      });
    });
  });

  describe('computed properties', () => {
    describe('errorMessage', () => {
      context('when there was a pagination error', () => {
        it('returns a user-friendly error message', async() => {
          const wrapper = factory({
            storeState: {
              error: 'Sorry! It is not possible to paginate beyond the first 5000 search results.'
            }
          });

          wrapper.vm.errorMessage.should.eq('messages.paginationLimitExceeded');
        });
      });
    });

    describe('noMoreResults', () => {
      context('when there are 0 results in total', () => {
        const wrapper = factory({
          storeState: { totalResults: 0 }
        });

        it('is `false`', () => {
          wrapper.vm.noMoreResults.should.be.false;
        });
      });

      context('when there are some results in total', () => {
        context('and results here', () => {
          const wrapper = factory({
            storeState: {
              totalResults: 100,
              results: [
                {
                  europeanaId: '/123/abc',
                  dcTitle: { def: ['Record 123/abc'] },
                  edmPreview: 'https://www.example.org/abc.jpg',
                  edmDataProvider: ['Provider 123']
                }
              ]
            }
          });

          it('is `false`', () => {
            wrapper.vm.noMoreResults.should.be.false;
          });
        });

        context('but no results here', () => {
          const wrapper = factory({
            storeState: {
              totalResults: 100
            }
          });

          it('is `true`', () => {
            wrapper.vm.noMoreResults.should.be.true;
          });
        });
      });
    });

    describe('orderedFacets', () => {
      const wrapper = factory({
        storeState: {
          facets: [
            { name: 'COUNTRY' },
            { name: 'RIGHTS' },
            { name: 'CONTRIBUTOR' },
            { name: 'DATA_PROVIDER' },
            { name: 'PROVIDER' },
            { name: 'LANGUAGE' },
            { name: 'REUSABILITY' },
            { name: 'TYPE' }
          ]
        }
      });

      it('injects collection first', () => {
        wrapper.vm.orderedFacets[0].name.should.eq('collection');
      });

      it('follows with ordered default facets from search plugin', () => {
        wrapper.vm.orderedFacets[1].name.should.eq('TYPE');
        wrapper.vm.orderedFacets[2].name.should.eq('REUSABILITY');
        wrapper.vm.orderedFacets[3].name.should.eq('COUNTRY');
        wrapper.vm.orderedFacets[4].name.should.eq('LANGUAGE');
        wrapper.vm.orderedFacets[5].name.should.eq('PROVIDER');
        wrapper.vm.orderedFacets[6].name.should.eq('DATA_PROVIDER');
      });

      it('ends with any other facets in their original order', () => {
        wrapper.vm.orderedFacets[7].name.should.eq('RIGHTS');
        wrapper.vm.orderedFacets[8].name.should.eq('CONTRIBUTOR');
      });
    });

    describe('coreFacets', () => {
      const wrapper = factory({
        storeState: {
          facets: [
            { name: 'COUNTRY' },
            { name: 'RIGHTS' },
            { name: 'CONTRIBUTOR' },
            { name: 'DATA_PROVIDER' },
            { name: 'PROVIDER' },
            { name: 'LANGUAGE' },
            { name: 'REUSABILITY' },
            { name: 'TYPE' }
          ]
        }
      });

      it('returns core facets only', () => {
        wrapper.vm.coreFacets.map(coreFacet => coreFacet.name).should.eql(['collection', 'TYPE', 'REUSABILITY', 'COUNTRY']);
      });
    });

    describe('moreFacets', () => {
      const wrapper = factory({
        storeState: {
          facets: [
            { name: 'COUNTRY' },
            { name: 'RIGHTS' },
            { name: 'CONTRIBUTOR' },
            { name: 'DATA_PROVIDER' },
            { name: 'PROVIDER' },
            { name: 'LANGUAGE' },
            { name: 'REUSABILITY' },
            { name: 'TYPE' }
          ]
        }
      });

      it('returns non-core facets only', () => {
        wrapper.vm.moreFacets.map(moreFacet => moreFacet.name).should.eql(['LANGUAGE', 'PROVIDER', 'DATA_PROVIDER']);
      });
    });

    describe('view', () => {
      describe('setter', () => {
        it('commits to the search store', () => {
          const wrapper = factory();
          const view = 'list';

          wrapper.vm.view = view;

          searchSetViewMutation.should.have.been.calledWith(sinon.match.any, view);
        });
      });
    });
  });

  describe('methods', () => {
    describe('changeFacet', () => {
      const facetName = 'TYPE';

      context('when facet had selected values', () => {
        const initialSelectedValues = ['"IMAGE"'];
        const storeGetters = {
          filters: () => {
            return { 'TYPE': ['"IMAGE"'] };
          }
        };

        context('and they changed', () => {
          const newSelectedValues = ['"IMAGE"', '"TEXT"'];

          it('triggers rerouting', async() => {
            const wrapper = factory({ storeGetters });
            const searchRerouter = sinon.spy(wrapper.vm, 'rerouteSearch');

            await wrapper.vm.changeFacet(facetName, newSelectedValues);
            searchRerouter.should.have.been.called;
          });
        });

        context('and they were unchanged', () => {
          it('does not trigger rerouting', async() => {
            const wrapper = factory({ storeGetters });
            const searchRerouter = sinon.spy(wrapper.vm, 'rerouteSearch');

            await wrapper.vm.changeFacet(facetName, initialSelectedValues);
            searchRerouter.should.not.have.been.called;
          });
        });
      });

      context('when facet had no selected values', () => {
        const storeGetters = {
          filters: () => {
            return {};
          }
        };

        context('and some were selected', () => {
          const newSelectedValues = ['"IMAGE"', '"TEXT"'];

          it('triggers rerouting', async() => {
            const wrapper = await factory({ storeGetters });
            const searchRerouter = sinon.spy(wrapper.vm, 'rerouteSearch');

            await wrapper.vm.changeFacet(facetName, newSelectedValues);
            searchRerouter.should.have.been.called;
          });
        });

        context('and none were selected', () => {
          const newSelectedValues = [];

          it('does not trigger rerouting', async() => {
            const wrapper = factory({ storeGetters });
            const searchRerouter = sinon.spy(wrapper.vm, 'rerouteSearch');

            await wrapper.vm.changeFacet(facetName, newSelectedValues);
            searchRerouter.should.not.have.been.called;
          });
        });
      });
    });

    describe('showContentTierToast', () => {
      const elementId = 'tier-toast';
      let facets = [];

      context('in browser', () => {
        beforeEach(() => {
          process.browser = true;
          global.sessionStorage = {};
        });

        context('with contentTier "0" facet field', () => {
          beforeEach(() => {
            facets = [
              { name: 'contentTier', fields: [{ label: '"0"' }] }
            ];
          });

          context('when toast has not yet been shown this session', () => {
            it('shows the toast', async() => {
              const wrapper = factory({
                storeState: { facets }
              });
              wrapper.vm.$bvToast.show = sinon.spy();
              global.sessionStorage.contentTierToastShown = false;
              await wrapper.vm.showContentTierToast();
              wrapper.vm.$bvToast.show.should.have.been.calledWith(elementId);
            });

            it('updates session storage after toast is shown', async() => {
              const wrapper = factory({
                storeState: { facets }
              });
              global.sessionStorage.contentTierToastShown = false;
              await wrapper.vm.showContentTierToast();
              await wrapper.vm.$root.$emit('bv::toast:shown');

              global.sessionStorage.contentTierToastShown.should.eql('true');
            });
          });

          context('when toast has previously been shown this session', () => {
            beforeEach(() => {
              global.sessionStorage.contentTierToastShown = true;
            });

            it('does not show the toast', async() => {
              const wrapper = factory({
                storeState: { facets }
              });
              wrapper.vm.$bvToast.show = sinon.spy();

              await wrapper.vm.showContentTierToast();

              wrapper.vm.$bvToast.show.should.not.have.been.called;
            });
          });
        });

        context('without contentTier 0 facet field', () => {
          beforeEach(() => {
            facets = [
              { name: 'contentTier', fields: [{ label: '"1"' }] }
            ];
          });

          it('does not show the toast', async() => {
            const wrapper = factory({
              storeState: { facets }
            });
            wrapper.vm.$bvToast.show = sinon.spy();

            await wrapper.vm.showContentTierToast();

            wrapper.vm.$bvToast.show.should.not.have.been.called;
          });
        });
      });

      context('when not in browser', () => {
        beforeEach(() => {
          process.browser = false;
        });

        it('does not show the toast', async() => {
          const wrapper = factory();
          wrapper.vm.$bvToast.show = sinon.spy();

          await wrapper.vm.showContentTierToast();

          wrapper.vm.$bvToast.show.should.not.have.been.called;
        });
      });
    });
  });
});
