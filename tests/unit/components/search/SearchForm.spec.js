import { createLocalVue, shallowMount } from '@vue/test-utils';
import SearchForm from '../../../../components/search/SearchForm.vue';
import Vuex from 'vuex';
import sinon from 'sinon';
import nock from 'nock';
import apiConfig from '../../../../modules/apis/defaults';

const axios = require('axios');
axios.defaults.adapter = require('axios/lib/adapters/http');

const localVue = createLocalVue();
localVue.use(Vuex);

const $goto = sinon.spy();

const $path = sinon.stub();
$path.withArgs({ name: 'search' }).returns('/search');
$path.withArgs({
  name: 'collections-type-all', params: {
    type: 'topic',
    pathMatch: '227-fresco'
  }
}).returns('/collections/topic/227-fresco');
$path.withArgs({
  name: 'collections-type-all', params: {
    type: 'person',
    pathMatch: '59981-frank-sinatra'
  }
}).returns('/collections/person/59981-frank-sinatra');

const factory = (options = {}) => shallowMount(SearchForm, {
  localVue,
  stubs: ['b-input-group', 'b-button', 'b-form', 'b-form-input'],
  mocks: {
    ...{
      $i18n: { locale: 'en' },
      $t: () => {},
      $route: { query: {} },
      $goto,
      $path
    }, ...(options.mocks || {})
  },
  store: options.store || store({ search: {} })
});

const getters = {
  'apis/config': () => apiConfig,
  'search/activeView': (state) => state.search.view,
  'search/queryUpdatesForFacetChanges': () => () => {},
  'ui/searchView': (state) => state.ui.showSearch
};
const store = (searchState = {}, uiState = {}) => {
  return new Vuex.Store({
    getters,
    state: {
      i18n: { locale: 'en' },
      search: searchState,
      ui: uiState
    }
  });
};

const entityApiSuggestionsResponse = {
  'items': [
    {
      'id': 'http://data.europeana.eu/concept/base/227',
      'type': 'Concept',
      'prefLabel': {
        'en': 'Fresco'
      }
    },
    {
      'id': 'http://data.europeana.eu/agent/base/59981',
      'type': 'Agent',
      'prefLabel': {
        'en': 'Frank Sinatra'
      }
    }
  ]
};

describe('components/search/SearchForm', () => {
  beforeEach(() => {
    $goto.resetHistory();
  });
  it('contains the show mobile search button', () => {
    const wrapper = factory({
      store: store({})
    });
    const showSearchButton = wrapper.find('[data-qa="show mobile search button"]');
    showSearchButton.attributes().class.should.contain('d-lg-none');
    showSearchButton.isVisible().should.equal(true);
  });

  describe('query', () => {
    it('is read from the route', () => {
      const wrapper = factory({
        mocks: {
          $route: {
            query: {
              query: 'cartography'
            }
          }
        }
      });

      wrapper.vm.query.should.eq('cartography');
    });
  });

  describe('routePath', () => {
    context('when on a search page', () => {
      const wrapper = factory({
        mocks: {
          $route: {
            path: '/somewhere',
            query: {}
          }
        },
        store: store({
          active: true
        })
      });

      it('uses current route path', () => {
        wrapper.vm.routePath.should.eq('/somewhere');
      });
    });

    context('when not on a search page', () => {
      const wrapper = factory({
        mocks: {
          $path
        },
        store: store({
          active: false
        })
      });

      it('uses default search route path', () => {
        wrapper.vm.routePath.should.eql('/search');
      });
    });
  });

  describe('form submission', () => {
    const query = 'trees';

    context('with a selected entity suggestion', () => {
      it('routes to the entity page', async() => {
        const state = {
          active: true,
          userParams: {
            query: ''
          },
          view: 'grid'
        };
        const wrapper = factory({ store: store(state) });

        wrapper.setData({
          selectedSuggestion: 'Fresco',
          query
        });
        wrapper.vm.submitForm();

        let searchRoute = {
          path: '/search',
          query: {
            query: '"Fresco"',
            view: state.view
          }
        };

        $goto.should.have.been.calledWith(searchRoute);
      });
    });

    context('when on a search page', () => {
      it('updates current route', () => {
        const state = {
          active: true,
          userParams: {
            query: ''
          },
          view: 'grid'
        };
        const wrapper = factory({ store: store(state) });

        wrapper.setData({
          query
        });
        wrapper.vm.submitForm();

        const newRouteParams = {
          path: wrapper.vm.$route.path,
          query: { query, page: 1, view: state.view }
        };
        $goto.should.have.been.calledWith(newRouteParams);
      });
    });

    context('when not on a search page', () => {
      it('reroutes to search', () => {
        const state = {
          active: false,
          userParams: {
            query: ''
          },
          view: 'list'
        };
        const wrapper = factory({ store: store(state) });

        wrapper.setData({
          query
        });
        wrapper.vm.submitForm();

        const newRouteParams = {
          path: '/search',
          query: { query, page: 1, view: state.view }
        };
        $goto.should.have.been.calledWith(newRouteParams);
      });
    });
  });

  describe('suggestionLinkGen', () => {
    const state = {
      active: false,
      userParams: {
        query: ''
      },
      view: 'grid'
    };
    const wrapper = factory({ store: store(state) });

    it('generates search suggestion URLs', () => {
      const link = wrapper.vm.suggestionLinkGen('Fresco');
      link.path.should.eq('/search');
      link.query.query.should.eq('"Fresco"');
      link.query.view.should.eq('grid');
    });
  });

  describe('getSearchSuggestions', () => {
    beforeEach(() => {
      nock(apiConfig.entity.origin).get('/entity/suggest')
        .query(true)
        .reply(200, entityApiSuggestionsResponse);
    });

    afterEach(() => {
      nock.cleanAll();
    });

    context('auto-suggest is not enabled (by default)', () => {
      const wrapper = factory();
      it('does not get suggestions from the Entity API', async() => {
        await wrapper.vm.getSearchSuggestions();

        nock.isDone().should.not.be.true;
      });
    });

    context('auto-suggest is enabled (by prop)', () => {
      const wrapper = factory();
      wrapper.setProps({ enableAutoSuggest: true });

      it('gets suggestions from the Entity API', async() => {
        await wrapper.vm.getSearchSuggestions();

        nock.isDone().should.be.true;
      });

      // FIXME
      // it('parses and stores suggestions locally', async() => {
      //   await wrapper.vm.getSearchSuggestions();
      //
      //   wrapper.vm.suggestions.should.deep.eq(parsedSuggestions);
      // });
    });
  });

  describe('mobile search buttons', () => {
    context('on collection pages (with a "pill")', () => {
      const searchState = {
        active: true,
        pill: {
          values: ['Theatre']
        },
        view: 'grid'
      };
      const uiState = {
        showSearch: true
      };
      const wrapper = factory({ store: store(searchState, uiState) });
      wrapper.setData({
        showSearchQuery: true
      });
      const collectionSearchButton = wrapper.find('[data-qa="search in collection button"]');
      const entireSearchButton = wrapper.find('[data-qa="search entire collection button"]');

      it('contains the search in collection button', () => {
        collectionSearchButton.attributes().class.should.contain('search');
        collectionSearchButton.isVisible().should.be.true;
      });

      it('contains the search entire collection button', () => {
        entireSearchButton.attributes().class.should.contain('search');
        entireSearchButton.isVisible().should.be.true;
      });
    });
  });
});
