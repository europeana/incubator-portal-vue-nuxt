<template>
  <b-container>
    <b-row
      v-if="errorMessage"
      class="mb-3"
    >
      <b-col>
        <AlertMessage
          :error="errorMessage"
        />
      </b-col>
    </b-row>
    <template
      v-else
    >
      <b-row class="mb-3">
        <b-col
          data-qa="search filters"
        >
          <client-only>
            <SearchFilters />
            <div class="position-relative">
              <FacetDropdown
                v-for="facet in coreFacets"
                :key="facet.name"
                :name="facet.name"
                :fields="facet.fields"
                :type="facetDropdownType(facet.name)"
                :selected="filters[facet.name]"
                role="search"
                :aria-label="`${facet.name} dropdown button`"
                @changed="changeFacet"
              />
              <MoreFiltersDropdown
                v-if="enableMoreFacets"
                :more-facets="moreFacets"
                :selected="moreSelectedFacets"
                role="search"
                aria-label="more filters dropdown button"
                @changed="changeMoreFacets"
              />
              <button
                v-if="isFilteredByDropdowns()"
                class="reset"
                data-qa="reset filters button"
                @click="resetFilters"
              >
                {{ $t('reset') }}
              </button>
            </div>
          </client-only>
        </b-col>
      </b-row>
      <b-row
        v-if="noResults"
        class="mb-3"
      >
        <b-col>
          <AlertMessage
            :error="$t('noResults')"
          />
        </b-col>
      </b-row>
      <b-row
        v-if="hasAnyResults"
        class="mb-3"
      >
        <b-col>
          <p data-qa="total results">
            {{ $t('results') }}: {{ totalResults | localise }}
          </p>
        </b-col>
        <b-col>
          <ViewToggles
            v-model="view"
            :link-gen-route="route"
          />
        </b-col>
      </b-row>
      <b-row
        class="mb-3"
      >
        <b-col
          cols="12"
        >
          <b-row
            class="mb-3"
          >
            <b-col>
              <p
                v-if="noMoreResults"
                data-qa="warning notice"
              >
                {{ $t('noMoreResults') }}
              </p>
              <SearchResults
                v-model="results"
                :view="view"
                :per-row="perRow"
              />
              <InfoMessage
                v-if="lastAvailablePage"
                :message="$t('resultsLimitWarning')"
              />
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <client-only>
                <PaginationNav
                  v-if="showPagination"
                  v-model="page"
                  :total-results="totalResults"
                  :per-page="perPage"
                  :link-gen="paginationLink"
                />
              </client-only>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </template>
    <b-toast
      id="tier-toast"
      toast-class="brand-toast"
      toaster="b-toaster-bottom-left"
      auto-hide-delay="10000"
      is-status
      no-close-button
      solid
      data-qa="tier toast"
    >
      {{ $t('facets.contentTier.notification') }}
    </b-toast>
  </b-container>
</template>

<script>
  import ClientOnly from 'vue-client-only';
  import SearchResults from './SearchResults'; // Sorted before InfoMessage to prevent Conflicting CSS sorting warning
  import InfoMessage from '../generic/InfoMessage';
  import ViewToggles from './ViewToggles';

  import isEqual from 'lodash/isEqual';
  import pickBy from 'lodash/pickBy';
  import { mapState, mapGetters } from 'vuex';
  import { thematicCollections } from '../../plugins/europeana/search';
  import { queryUpdatesForFilters } from '../../store/search';

  export default {
    name: 'SearchInterface',

    components: {
      AlertMessage: () => import('../../components/generic/AlertMessage'),
      ClientOnly,
      InfoMessage,
      FacetDropdown: () => import('../../components/search/FacetDropdown'),
      MoreFiltersDropdown: () => import('../../components/search/MoreFiltersDropdown'),
      SearchResults,
      SearchFilters: () => import('../../components/search/SearchFilters'),
      PaginationNav: () => import('../../components/generic/PaginationNav'),
      ViewToggles
    },
    props: {
      perPage: {
        type: Number,
        default: 24
      },
      perRow: {
        type: Number,
        default: 4
      },
      route: {
        type: Object,
        default: () => {
          return { name: 'search' };
        }
      }
    },
    fetch() {
      this.viewFromRouteQuery();
    },
    data() {
      return {
        coreFacetNames: ['collection', 'TYPE', 'COUNTRY', 'REUSABILITY'],
        PROXY_DCTERMS_ISSUED: 'proxy_dcterms_issued'
      };
    },
    computed: {
      ...mapState({
        userParams: state => state.search.userParams,
        entityId: state => state.entity.id,
        error: state => state.search.error,
        facets: state => state.search.facets,
        lastAvailablePage: state => state.search.lastAvailablePage,
        resettableFilters: state => state.search.resettableFilters,
        results: state => state.search.results,
        totalResults: state => state.search.totalResults
      }),
      ...mapGetters({
        facetNames: 'search/facetNames',
        filters: 'search/filters',
        queryUpdatesForFacetChanges: 'search/queryUpdatesForFacetChanges',
        collection: 'search/collection'
      }),
      qf() {
        return this.userParams.qf;
      },
      query() {
        return this.userParams.query;
      },
      reusability() {
        return this.userParams.reusability;
      },
      api() {
        return this.userParams.api;
      },
      page() {
        // This causes double jumps on pagination when using the > arrow, for some reason
        // return this.userParams.page;

        // This is a workaround
        return Number(this.$route.query.page || 1);
      },
      errorMessage() {
        if (!this.error) return null;

        const paginationError = this.error.match(/It is not possible to paginate beyond the first (\d+)/);
        if (paginationError !== null) {
          const localisedPaginationLimit = this.$options.filters.localise(Number(paginationError[1]));
          return this.$t('messages.paginationLimitExceeded', { limit: localisedPaginationLimit });
        }

        return this.error;
      },
      hasAnyResults() {
        return this.totalResults > 0;
      },
      noMoreResults() {
        return this.hasAnyResults && this.results.length === 0;
      },
      noResults() {
        return this.totalResults === 0;
      },
      /**
       * Sort the facets for display
       * Facets are returned in the hard-coded preferred order from the search
       * plugin, followed by all others in the order the API returned them.
       * @return {Object[]} ordered facets
       * TODO: does this belong in its own component?
       */
      orderedFacets() {
        let unordered = this.facets.slice();
        let ordered = [];

        for (const facetName of this.facetNames) {
          const index = unordered.findIndex((f) => {
            return f.name === facetName;
          });
          if (index !== -1) {
            ordered = ordered.concat(unordered.splice(index, 1));
          }
        }

        if (this.$store.state.search.collectionFacetEnabled) {
          ordered.unshift({ name: 'collection', fields: thematicCollections });
        }
        return ordered.concat(unordered);
      },
      coreFacets() {
        return this.orderedFacets.filter(facet => this.coreFacetNames.includes(facet.name));
      },
      moreFacetNames() {
        return this.facetNames.filter(facetName => !this.coreFacetNames.includes(facetName));
      },
      moreFacets() {
        return this.orderedFacets.filter(facet => this.moreFacetNames.includes(facet.name));
      },
      moreSelectedFacets() {
        // TODO: use resettableFilters here?
        // TODO: if not, move newspaper filter names into store/collections/newspapers?
        return pickBy(this.filters, (selected, name) => this.moreFacetNames.includes(name) || ['api', this.PROXY_DCTERMS_ISSUED].includes(name));
      },
      enableMoreFacets() {
        return this.moreFacets.length > 0;
      },
      contentTierZeroPresent() {
        return this.moreFacets.some(facet => {
          return facet.name === 'contentTier' && facet.fields && facet.fields.some(option => option.label === '"0"');
        });
      },
      contentTierZeroActive() {
        return this.filters.contentTier && this.filters.contentTier.some(filter => {
          return filter === '"0"' || filter === '*'; // UI applies "0", this won't handle user provided values.
        });
      },
      showPagination() {
        return this.totalResults > this.perPage;
      },
      routeQueryView() {
        return this.$route.query.view;
      },
      view: {
        get() {
          return this.$store.getters['search/activeView'];
        },
        set(value) {
          this.$store.commit('search/setView', value);
        }
      }
    },
    watch: {
      routeQueryView: 'viewFromRouteQuery',
      contentTierZeroPresent: 'showContentTierToast',
      contentTierZeroActive: 'showContentTierToast'
    },
    mounted() {
      this.showContentTierToast();
    },
    methods: {
      viewFromRouteQuery() {
        if (this.routeQueryView) this.view = this.routeQueryView;
      },
      facetDropdownType(name) {
        return name === 'collection' ? 'radio' : 'checkbox';
      },
      changeFacet(name, selected) {
        if (typeof this.filters[name] === 'undefined') {
          if ((Array.isArray(selected) && selected.length === 0) || !selected) return;
        }
        if (isEqual(this.filters[name], selected)) return;

        return this.rerouteSearch(this.queryUpdatesForFacetChanges({ [name]: selected }));
      },
      changeMoreFacets(selected) {
        return this.rerouteSearch(this.queryUpdatesForFacetChanges(selected));
      },
      paginationLink(val) {
        return this.$path({ ...this.route, ...{ query: this.updateCurrentSearchQuery({ page: val }) } });
      },
      rerouteSearch(queryUpdates) {
        const query = this.updateCurrentSearchQuery(queryUpdates);
        this.$goto(this.$path({ ...this.route, ...{ query } }));
      },
      updateCurrentSearchQuery(updates = {}) {
        const current = {
          page: this.page,
          qf: this.qf,
          query: this.query,
          reusability: this.reusability,
          view: this.view,
          api: this.api
        };

        const updated = { ...current, ...updates };

        for (const key in updated) {
          // If any updated values are `null`, remove them from the query
          if (updated[key] === null) {
            delete updated[key];
          }
        }

        return updated;
      },
      resetFilters() {
        const filters = Object.assign({}, this.filters);

        for (const filterName of this.resettableFilters) {
          filters[filterName] = [];
        }
        this.$store.commit('search/clearResettableFilters');
        return this.rerouteSearch(queryUpdatesForFilters(filters));
      },
      isFilteredByDropdowns() {
        return this.$store.getters['search/hasResettableFilters'];
      },
      showContentTierToast() {
        if (!process.browser) return;

        if (sessionStorage.contentTierToastShown || this.contentTierZeroActive || !this.contentTierZeroPresent) {
          return;
        }
        this.$bvToast.show('tier-toast');
        sessionStorage.contentTierToastShown = 'true';
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import './assets/scss/variables.scss';

  .reset {
    background: none;
    border: none;
    color: $black;
    font-size: $font-size-small;
    text-transform: uppercase;
  }
</style>
