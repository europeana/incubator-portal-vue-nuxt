import * as store from '../../../store/search';
import apiConfig from '../../../modules/apis/defaults';
import axios from 'axios';
import nock from 'nock';
import sinon from 'sinon';

axios.defaults.adapter = require('axios/lib/adapters/http');

const apiUrl = apiConfig.record.origin;
const apiEndpoint = `${apiConfig.record.path}/search.json`;
const apiKey = '1234';

const baseRequest = nock(apiUrl).get(apiEndpoint);
const defaultResponse = { success: true, items: [], totalResults: 123456 };

describe('store/search', () => {
  beforeEach(() => {
    apiConfig.record.key = apiKey;
    apiConfig.newspaper.key = apiKey;
  });

  describe('getters', () => {
    describe('filters()', () => {
      context('when collection param is absent', () => {
        const collection = undefined;

        it('is false', () => {
          store.getters.hasCollectionSpecificSettings({})(collection).should.be.false;
        });
      });

      context('with `null` query qf', () => {
        it('returns {}', async() => {
          const state = {
            apiParams: {},
            userParams: {
              qf: null
            }
          };

          store.getters.filters(state).should.eql({});
        });
      });

      context('with single query qf value', () => {
        it('returns it in an array on a property named for the facet', async() => {
          const state = {
            apiParams: {},
            userParams: {
              qf: 'TYPE:"IMAGE"'
            }
          };

          store.getters.filters(state).should.deep.eql({ 'TYPE': ['"IMAGE"'] });
        });
      });

      context('with multiple query qf values', () => {
        it('returns them in arrays on properties named for each facet', async() => {
          const query = { qf: ['TYPE:"IMAGE"', 'TYPE:"VIDEO"', 'REUSABILITY:open'] };
          const expected = { 'TYPE': ['"IMAGE"', '"VIDEO"'], 'REUSABILITY': ['open'] };

          const state = {
            apiParams: {},
            userParams: query
          };

          store.getters.filters(state).should.deep.eql(expected);
        });
      });

      context('with reusability values', () => {
        it('returns them in an array on REUSABILITY property', async() => {
          const query = { reusability: 'open,restricted' };
          const expected = { 'REUSABILITY': ['open', 'restricted'] };

          const state = {
            apiParams: {},
            userParams: query
          };

          store.getters.filters(state).should.deep.eql(expected);
        });
      });

      context('with api value', () => {
        it('returns it as a string on api property', async() => {
          const query = { api: 'metadata' };
          const expected = { 'api': 'metadata' };

          const state = {
            apiParams: query,
            userParams: {}
          };

          store.getters.filters(state).should.deep.eql(expected);
        });
      });

      context('with query that has two colons', () => {
        it('returns an array with a string seperated by a colon ', async() => {
          const query = { qf: 'DATA_PROVIDER:"Galiciana: Biblioteca Digital de Galicia"' };
          const expected = { 'DATA_PROVIDER': ['"Galiciana: Biblioteca Digital de Galicia"'] };

          const state = {
            apiParams: {},
            userParams: query
          };

          store.getters.filters(state).should.deep.eql(expected);
        });
      });
    });

    describe('queryUpdatesForFacetChanges', () => {
      const state = {
        resettableFilters: []
      };
      const getters = {};

      context('when facet is REUSABILITY', () => {
        context('with values selected', () => {
          const selected = { 'REUSABILITY': ['open', 'permission'] };
          it('sets `reusability` to values joined with ","', () => {
            const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);
            updates.reusability.should.eq('open,permission');
          });
        });

        context('with no values selected', () => {
          it('sets `reusability` to `null`', () => {
            const updates = store.getters.queryUpdatesForFacetChanges(state, getters)();
            updates.should.eql({ qf: [], page: 1 });
          });
        });
      });

      context('for default facets from search plugin supporting quotes', () => {
        it('includes fielded and quoted queries for each value in `qf`', () => {
          const selected = { 'TYPE': ['"IMAGE"', '"SOUND"'] };
          const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);
          updates.qf.should.include('TYPE:"IMAGE"');
          updates.qf.should.include('TYPE:"SOUND"');
        });
      });

      context('for default facets from search plugin not supporting quotes', () => {
        it('includes fielded but unquoted queries for each value in `qf`', () => {
          const selected = { 'MIME_TYPE': ['application/pdf'] };
          const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);
          updates.qf.should.include('MIME_TYPE:application/pdf');
        });
      });

      context('for any other facets', () => {
        it('includes fielded but unquoted queries for each value in `qf`', () => {
          const selected = { 'contentTier': ['4'] };
          const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);
          updates.qf.should.include('contentTier:4');
        });
      });

      context('in a collection having custom filters', () => {
        const state = {
          userParams: {
            qf: ['proxy_dcterms_issued:1900-01-01']
          },
          resettableFilters: ['proxy_dcterms_issued']
        };
        const getters = {
          collection: () => 'newspaper'
        };

        it('applies them', () => {
          const selected = { api: 'metadata', 'proxy_dcterms_issued': ['1900-01-02'] };

          const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);

          updates.qf.should.include('proxy_dcterms_issued:1900-01-02');
          updates.api.should.eq('metadata');
        });
      });

      context('with collection-specific facets already selected', () => {
        const state = {
          resettableFilters: ['collection', 'CREATOR', 'TYPE']
        };
        const getters = {
          filters: {
            'CREATOR': ['"Missoni (Designer)"'],
            'TYPE': ['"IMAGE"'],
            'contentTier': ['*']
          },
          collection: 'fashion'
        };

        context('when collection is changed', () => {
          const selected = { 'collection': 'art' };

          it('removes collection-specific facet filters', () => {
            const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);

            updates.qf.should.not.include('CREATOR:"Missoni (Designer)"');
          });

          it('preserves generic facet filters', () => {
            const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);

            updates.qf.should.include('TYPE:"IMAGE"');
          });

          it('removes tier filter', () => {
            const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);

            updates.qf.should.not.include('contentTier:*');
          });
        });

        context('when collection is removed', () => {
          const selected = { 'collection': null };

          it('removes collection-specific facet filters', () => {
            const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);

            updates.qf.should.not.include('CREATOR:"Missoni (Designer)"');
          });

          it('preserves generic facet filters', () => {
            const updates = store.getters.queryUpdatesForFacetChanges(state, getters)(selected);

            updates.qf.should.include('TYPE:"IMAGE"');
          });
        });
      });
    });

    describe('hasCollectionSpecificSettings', () => {
      context('when collection param is absent', () => {
        const collection = undefined;

        it('is false', () => {
          store.getters.hasCollectionSpecificSettings({})(collection).should.be.false;
        });
      });

      context('when collection param is present', () => {
        const collection = 'music';

        context('when rootState has collection store for the collection', () => {
          context('with `enabled` property', () => {
            context('that is enabled', () => {
              const rootState = { collections: { [collection]: { enabled: true } } };
              it('is true', () => {
                store.getters.hasCollectionSpecificSettings({}, {}, rootState)(collection).should.be.true;
              });
            });

            context('that is disabled', () => {
              const rootState = { collections: { [collection]: { enabled: false } } };
              it('is false', () => {
                store.getters.hasCollectionSpecificSettings({}, {}, rootState)(collection).should.be.false;
              });
            });
          });

          context('without `enabled` property', () => {
            const rootState = { collections: { [collection]: {} } };
            it('is true', () => {
              store.getters.hasCollectionSpecificSettings({}, {}, rootState)(collection).should.be.true;
            });
          });
        });

        context('when rootState lacks collection store for the collection', () => {
          const rootState = { collections: {} };
          it('is false', () => {
            store.getters.hasCollectionSpecificSettings({}, {}, rootState)(collection).should.be.false;
          });
        });
      });
    });

    describe('apiParamsChanged', () => {
      context('with params added', () => {
        it('returns their names', () => {
          const state = {
            previousApiParams: {
              query: '*:*'
            },
            apiParams: {
              query: '*:*',
              qf: ['TYPE:"IMAGE"']
            }
          };

          const apiParamsChanged = store.getters.apiParamsChanged(state);

          apiParamsChanged.should.eql(['qf']);
        });
      });

      context('with params removed', () => {
        it('returns their names', () => {
          const state = {
            previousApiParams: {
              query: '*:*',
              qf: ['TYPE:"IMAGE"']
            },
            apiParams: {
              query: '*:*'
            }
          };

          const apiParamsChanged = store.getters.apiParamsChanged(state);

          apiParamsChanged.should.eql(['qf']);
        });
      });

      context('without changed params', () => {
        it('returns their names', () => {
          const state = {
            previousApiParams: {
              query: '*:*',
              qf: ['TYPE:"IMAGE"']
            },
            apiParams: {
              query: '*:*',
              qf: ['TYPE:"IMAGE"']
            }
          };

          const apiParamsChanged = store.getters.apiParamsChanged(state);

          apiParamsChanged.should.eql([]);
        });
      });
    });

    describe('itemUpdateNeeded', () => {
      context('without previous API params', () => {
        const previousApiParams = null;

        it('is `true`', () => {
          const itemUpdateNeeded = store.getters.itemUpdateNeeded(
            { previousApiParams }
          );

          itemUpdateNeeded.should.be.true;
        });
      });

      context('with previous API params', () => {
        const previousApiParams = {
          query: '*:*'
        };

        for (const param of ['query', 'qf', 'reusability', 'api', 'page']) {
          context(`when ${param} param changes`, () => {
            it('is `true`', () => {
              const apiParamsChanged = [param];

              const itemUpdateNeeded = store.getters.itemUpdateNeeded(
                { previousApiParams },
                { apiParamsChanged }
              );

              itemUpdateNeeded.should.be.true;
            });
          });
        }

        for (const param of ['view']) {
          context(`when ${param} param changes`, () => {
            it('is `false`', () => {
              const apiParamsChanged = [param];

              const itemUpdateNeeded = store.getters.itemUpdateNeeded(
                { previousApiParams },
                { apiParamsChanged }
              );

              itemUpdateNeeded.should.be.false;
            });
          });
        }
      });
    });

    describe('facetUpdateNeeded', () => {
      context('without previous API params', () => {
        const previousApiParams = null;

        it('is `true`', () => {
          const facetUpdateNeeded = store.getters.facetUpdateNeeded(
            { previousApiParams }
          );

          facetUpdateNeeded.should.be.true;
        });
      });

      context('with previous API params', () => {
        const previousApiParams = {
          query: '*:*'
        };

        for (const param of ['query', 'qf', 'reusability', 'api']) {
          context(`when ${param} param changes`, () => {
            it('is `true`', () => {
              const apiParamsChanged = [param];

              const facetUpdateNeeded = store.getters.facetUpdateNeeded(
                { previousApiParams },
                { apiParamsChanged }
              );

              facetUpdateNeeded.should.be.true;
            });
          });
        }

        for (const param of ['page', 'view']) {
          context(`when ${param} param changes`, () => {
            it('is `false`', () => {
              const apiParamsChanged = [param];

              const facetUpdateNeeded = store.getters.facetUpdateNeeded(
                { previousApiParams },
                { apiParamsChanged }
              );

              facetUpdateNeeded.should.be.false;
            });
          });
        }
      });
    });
  });

  describe('actions', () => {
    describe('run', () => {
      it('derives the API params', async() => {
        const dispatch = sinon.spy();

        await store.actions.run({ dispatch, getters: {} });

        dispatch.should.have.been.calledWith('deriveApiSettings');
      });

      it('queries for items and facets if needed', async() => {
        const dispatch = sinon.spy();

        await store.actions.run({ dispatch, getters: { itemUpdateNeeded: true, facetUpdateNeeded: true } });

        dispatch.should.have.been.calledWith('queryItems');
        dispatch.should.have.been.calledWith('queryFacets');
      });

      it('omits query for items if not needed', async() => {
        const dispatch = sinon.spy();

        await store.actions.run({ dispatch, getters: { itemUpdateNeeded: false, facetUpdateNeeded: true } });

        dispatch.should.not.have.been.calledWith('queryItems');
        dispatch.should.been.calledWith('queryFacets');
      });

      it('omits query for facets if not needed', async() => {
        const dispatch = sinon.spy();

        await store.actions.run({ dispatch, getters: { itemUpdateNeeded: true, facetUpdateNeeded: false } });

        dispatch.should.have.been.calledWith('queryItems');
        dispatch.should.not.have.been.calledWith('queryFacets');
      });
    });

    describe('queryItems', () => {
      afterEach(() => {
        nock.cleanAll();
      });

      it('searches the Record API', async() => {
        const searchQuery = 'anything';
        const typeQf = 'TYPE:"IMAGE"';
        const collectionQf = 'collection:"migration"';
        const dispatch = sinon.spy();
        const state = { apiParams: { query: searchQuery, qf: [typeQf, collectionQf] } };

        baseRequest
          .query(query => {
            return query.query === searchQuery && query.qf.includes(typeQf) && query.qf.includes(collectionQf);
          })
          .reply(200, defaultResponse);

        await store.actions.queryItems({ dispatch, state });

        nock.isDone().should.be.true;
      });

      context('on success', () => {
        it('dispatches updateForSuccess', async() => {
          const commit = sinon.spy();
          const dispatch = sinon.spy();
          const state = {};

          baseRequest
            .query(true)
            .reply(200, defaultResponse);

          await store.actions.queryItems({ commit, dispatch, state });

          dispatch.should.have.been.calledWith('updateForSuccess');
        });
      });

      context('on failure', () => {
        it('dispatches updateForFailure', async() => {
          const commit = sinon.spy();
          const dispatch = sinon.spy();
          const state = {};
          const errorMessage = 'Invalid query parameter.';

          baseRequest
            .query(true)
            .reply(400, {
              success: false,
              error: errorMessage
            });

          await store.actions.queryItems({ commit, dispatch, state });

          dispatch.should.have.been.calledWith('updateForFailure');
        });
      });
    });

    describe('applyCollectionSpecificSettings', () => {
      it('TODO');
    });

    describe('deriveApiSettings', () => {
      it('combines userParams and overrideParams into apiParams', async() => {
        const userQuery = 'calais';
        const userQf = 'TYPE:"IMAGE"';
        const overrideQf = 'edm_agent:"http://data.europeana.eu/agent/base/200"';
        const profile = 'minimal';
        const facet = store.defaultFacetNames.join(',');

        const commit = sinon.spy();
        const dispatch = sinon.spy();
        const getters = sinon.spy();
        const rootGetters = sinon.spy();
        const state = {
          userParams: {
            query: userQuery,
            qf: userQf
          },
          overrideParams: {
            qf: [overrideQf]
          }
        };

        await store.actions.deriveApiSettings({ commit, dispatch, state, getters, rootGetters });

        commit.should.have.been.calledWith('set', [
          'apiParams',
          {
            query: userQuery,
            qf: [userQf, overrideQf],
            profile,
            facet
          }
        ]);
      });
    });

    describe('setResettableFilter', () => {
      it('commits removeResettableFilter for empty arrays', async() => {
        const name = 'TYPE';
        const selected = [];
        const commit = sinon.spy();

        await store.actions.setResettableFilter({ commit }, { name, selected });

        commit.should.have.been.calledWith('removeResettableFilter', name);
      });

      it('commits removeResettableFilter for falsy values', async() => {
        const name = 'proxy_dcterms_issued';
        const selected = false;
        const commit = sinon.spy();

        await store.actions.setResettableFilter({ commit }, { name, selected });

        commit.should.have.been.calledWith('removeResettableFilter', name);
      });

      it('commits addResettableFilter for non-empty arrays', async() => {
        const name = 'TYPE';
        const selected = ['IMAGE'];
        const commit = sinon.spy();

        await store.actions.setResettableFilter({ commit }, { name, selected });

        commit.should.have.been.calledWith('addResettableFilter', name);
      });

      it('commits addResettableFilter for truthy values', async() => {
        const name = 'proxy_dcterms_issued';
        const selected = true;
        const commit = sinon.spy();

        await store.actions.setResettableFilter({ commit }, { name, selected });

        commit.should.have.been.calledWith('addResettableFilter', name);
      });
    });
  });
});
