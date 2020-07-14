<template>
  <b-form
    ref="form"
    :class="showSearch ? 'open' : 'closed'"
    data-qa="search form"
    inline
    autocomplete="off"
    @submit.prevent="submitForm"
  >
    <b-input-group
      role="combobox"
      :aria-owns="enableAutoSuggest ? 'search-form-auto-suggest' : null"
      :aria-expanded="isAutoSuggestActive"
      class="auto-suggest"
    >
      <template
        v-if="pillLabel"
        v-slot:prepend
      >
        <SearchBarPill
          :text="pillLabel"
          :remove-link-label="$t('removeFilter', { filterLabel: pillLabel.values[0] })"
          :remove-link-to="pillRemoveLinkTo"
        />
      </template>
      <b-button
        v-show="showSearch"
        data-qa="back button"
        class="back d-lg-none"
        variant="light"
        :aria-label="$t('header.backToMenu')"
        @click="backToMenu"
      />
      <b-form-input
        v-show="showSearch"
        ref="searchbox"
        v-model="query"
        class="d-lg-block"
        :placeholder="$t('searchPlaceholder')"
        name="query"
        data-qa="search box"
        role="searchbox"
        aria-autocomplete="list"
        :aria-controls="enableAutoSuggest ? 'search-form-auto-suggest' : null"
        :aria-label="$t('search')"
        @input="getSearchSuggestions"
      />
      <b-button
        v-show="showSearch && showSearchQuery"
        data-qa="clear button"
        class="clear d-lg-none"
        variant="light"
        :aria-label="$t('header.clearQuery')"
        @click="clearQuery"
      />
      <template
        v-if="pillLabel"
      >
        <div
          v-show="showSearch && showSearchQuery"
          class="collection search-query d-lg-none"
        >
          <b-button
            type="submit"
            data-qa="search in collection button"
            class="search"
            variant="primary"
            :aria-label="$t('search')"
            @click="toggleSearchBar"
          >
            <span>{{ $t('header.inCollection', { query: query, collection: pillLabel.values[0] }) }}</span>
          </b-button>
        </div>
        <div
          v-show="showSearch && showSearchQuery"
          class="search-query d-lg-none"
        >
          <b-button
            data-qa="search entire collection button"
            class="search"
            variant="primary"
            :aria-label="$t('search')"
            @click.prevent="toggleSearchAndRemovePill"
          >
            <span>{{ $t('header.entireCollection', { query: query }) }}</span>
          </b-button>
        </div>
      </template>
      <template
        v-else
      >
        <div
          v-show="showSearch && showSearchQuery"
          class="search-query d-lg-none"
        >
          <b-button
            type="submit"
            data-qa="mobile search button"
            class="search"
            variant="primary"
            :aria-label="$t('search')"
            @click="toggleSearchBar"
          >
            <span>{{ $t('header.searchFor', { query: query }) }}</span>
          </b-button>
        </div>
      </template>
      <b-button
        type="submit"
        data-qa="desktop search button"
        class="search d-none d-lg-block"
        variant="primary"
        :aria-label="$t('search')"
      />
      <b-button
        v-show="!showSearch"
        data-qa="show mobile search button"
        class="search d-lg-none mr-3"
        variant="light"
        :aria-label="$t('search')"
        @click="toggleSearchBar"
      />
      <AutoSuggest
        v-if="enableAutoSuggest"
        v-model="suggestions"
        element-id="search-form-auto-suggest"
        :link-gen="suggestionLinkGen"
        :query="query"
        @select="selectSuggestion"
      />
    </b-input-group>
  </b-form>
</template>

<script>
  import AutoSuggest from './AutoSuggest';
  import SearchBarPill from './SearchBarPill';
  import { getEntitySuggestions } from '../../plugins/europeana/entity';
  import { mapGetters } from 'vuex';
  import match from 'autosuggest-highlight/match';

  export default {
    name: 'SearchForm',

    components: {
      AutoSuggest,
      SearchBarPill
    },

    props: {
      enableAutoSuggest: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        query: null,
        showSearchQuery: false,
        gettingSuggestions: false,
        suggestions: {},
        selectedSuggestion: null
      };
    },

    computed: {
      ...mapGetters({
        apiConfig: 'apis/config',
        queryUpdatesForFacetChanges: 'search/queryUpdatesForFacetChanges',
        showSearch: 'ui/searchView',
        view: 'search/activeView'
      }),

      isAutoSuggestActive() {
        return this.enableAutoSuggest && (this.suggestions.length > 0);
      },

      onSearchablePage() {
        return this.$store.state.search.active;
      },

      pillLabel() {
        return this.$store.state.search.pill;
      },

      routePath() {
        if (this.onSearchablePage) {
          return this.$route.path;
        }
        return this.$path({ name: 'search' });
      },

      pillRemoveLinkTo() {
        const query = {
          ...this.queryUpdatesForFacetChanges({ collection: null }),
          view: this.view,
          query: this.query || ''
        };

        return {
          path: this.$path({
            name: 'search'
          }),
          query
        };
      }
    },

    watch: {
      '$route'() {
        this.initQuery();
        if (this.showSearch) this.$store.commit('ui/toggleSearchBar');
      }
    },

    mounted() {
      this.initQuery();
    },

    methods: {
      initQuery() {
        this.query = this.$route.query.query;
      },

      selectSuggestion(value) {
        this.selectedSuggestion = value;
      },

      async submitForm() {
        let newRoute;

        if (this.selectedSuggestion) {
          newRoute = this.suggestionLinkGen(this.selectedSuggestion);
        } else {
          const newRouteQuery = { ...this.$route.query, ...{ page: 1, view: this.view, query: this.query || '' } };
          newRoute = { path: this.routePath, query: newRouteQuery };
        }

        this.suggestions = {};
        this.clearQuery();
        await this.$goto(newRoute);
        this.selectedSuggestion = null;
      },

      getSearchSuggestions(query) {
        if (query === '') {
          this.suggestions = {};
          this.showSearchQuery = false;
          return;
        }
        this.showSearchQuery = true;

        if (!this.enableAutoSuggest) return;

        // Don't go getting more suggestions if we are already waiting for some
        if (this.gettingSuggestions) return;

        const locale = this.$i18n.locale;
        this.gettingSuggestions = true;

        getEntitySuggestions(query, {
          language: locale
        })
          .then(suggestions => {
            this.suggestions = suggestions.reduce((memo, suggestion) => {
              const candidates = [(suggestion.prefLabel || {})[locale]]
                .concat((suggestion.altLabel || {})[locale]);
              memo[suggestion.id] = candidates.find(candidate => match(candidate, query).length > 0);
              return memo;
            }, {});
          })
          .catch(() => {
            this.suggestions = {};
          })
          .then(() => {
            this.gettingSuggestions = false;

            // If the query has changed in the meantime, go get new suggestions now
            if (query !== this.query) this.getSearchSuggestions(this.query);
          });
      },

      suggestionLinkGen(suggestion) {
        const query = {
          view: this.view,
          query: `"${suggestion}"`
        };
        return {
          path: this.$path({
            name: 'search'
          }),
          query
        };
      },

      toggleSearchBar() {
        this.$store.commit('ui/toggleSearchBar');
        if (this.showSearch) {
          this.$nextTick(() => {
            this.$refs.searchbox.focus();
          });
        }
      },

      backToMenu() {
        this.$store.commit('ui/toggleSearchBar');
        this.clearQuery();
      },

      clearQuery() {
        this.query = '';
        this.showSearchQuery = false;
      },

      async toggleSearchAndRemovePill() {
        this.toggleSearchBar();
        await this.$goto(this.pillRemoveLinkTo);
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import './assets/scss/variables.scss';
  @import './assets/scss/icons.scss';

  .form-inline {
    width: auto;
  }

  .input-group {
    width: 100%;

    .input-group-prepend {
      align-items: center;
      background-color: $offwhite;
      padding-left: 0.75rem;
      padding-right: 0.1rem;
      border-radius: $border-radius 0 0 $border-radius;
    }
  }

  .form-control {
    background-color: $white;
  }

  .btn {
    border-radius: 0;
    font-size: 1rem;
    box-shadow: none;

    &:before {
      @extend .icon-font;
      display: inline-block;
      font-size: 1.1rem;
    }
    &.search:before {
      content: '\e92b';
    }
    &.back {
      position: absolute;
      left: 1rem;
      top: 1rem;
      z-index: 99;
      &:before {
        content: '\ea40';
      }
    }
    &.clear {
      position: absolute;
      right: 1rem;
      top: 1rem;
      z-index: 99;
      &:before {
        content: '\e904';
      }
    }
  }

  @media (max-width: $bp-large) {
    .btn {
      background: none;
      color: $black;
      border: none;
      padding: 0;
      height: 1.5rem;
      width: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .form-inline {
      &.open {
        width: 100%;
        .form-control {
          width: 100%;
          padding: 0.375rem 1rem 0.375rem 3.5rem;
          height: 3.5rem;
          color: $mediumgrey;
          box-shadow: $boxshadow-light;
        }
        .search-query {
          width: 100%;
          height: 3.5rem;
          font-size: 1rem;
          color: $mediumgrey;
          display: flex;
          align-items: center;
          position: relative;
          background: $white;
          .search {
            position: absolute;
            width: 100%;
            left: 0;
            top: 0;
            z-index: 99;
            height: 3.5rem;
            padding: 0.375rem 1rem 0.375rem 3.5rem;
            justify-content: flex-start;
            &:focus {
              background: $white;
              outline: none;
              color: $black;
              ~ span {
                z-index: 99;
              }
            }
            &:before {
              left: 1rem;
              top: 1rem;
              position: absolute;
              width: 24px;
              height: 24px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          }
        }
      }
    }
    .input-group .input-group-prepend {
      display: none;
    }
  }

  @media (min-width: $bp-large) {
    .input-group {
      margin: 0.46875rem 0;
    }
    .btn {
      border-radius: 0 $border-radius $border-radius 0;
      background: $blue;
      border-color: $blue;
      color: $white;
      padding: 0.375rem 0.75rem;
      height: auto;
      width: auto;
      outline: none;

      &:before {
        transform: translateY(-0.1rem);
      }
    }
    .form-control:not(:first-child) {
      display: block;
      background-color: $offwhite;
      border-radius: $border-radius 0 0 $border-radius;
      margin-right: 0;
    }
  }
</style>
