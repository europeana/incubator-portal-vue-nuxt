<template>
  <div>
    <NotificationBanner
      v-if="redirectNotificationsEnabled"
      :notification-url="notificationUrl"
      :notification-text="$t('linksToClassic.search.text')"
      :notification-link-text="$t('linksToClassic.search.linkText')"
      class="mb-3"
    />
    <b-container data-qa="search page">
      <b-row>
        <b-col>
          <h1>{{ $t('search') }}</h1>
        </b-col>
        <RelatedCollections
          v-if="relatedCollectionsEnabled"
          :query="this.$route.query.query"
        />
        <SearchInterface
          :per-row="4"
        />
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import SearchInterface from '../../components/search/SearchInterface';
  import { pageFromQuery } from '../../plugins/utils';
  import legacyUrl from '../../plugins/europeana/legacy-search';
  import NotificationBanner from '../../components/generic/NotificationBanner';

  export default {
    components: {
      SearchInterface,
      NotificationBanner,
      RelatedCollections: () => import('../../components/generic/RelatedCollections')
    },

    middleware({ query, redirect, app }) {
      const currentPage = pageFromQuery(query.page);

      if (currentPage === null) {
        // Redirect non-positive integer values for `page` to `page=1`
        return redirect(app.$path({ name: 'search', query: { ...query, ...{ page: '1' } } }));
      }
    },

    async fetch({ store, query, res }) {
      await store.dispatch('search/activate');
      store.commit('search/set', ['userParams', query]);

      await store.dispatch('search/run');
      if (store.state.search.error && typeof res !== 'undefined') {
        res.statusCode = store.state.search.errorStatusCode;
      }
    },
    computed: {
      notificationUrl() {
        return legacyUrl(this.$route.query, this.$store.state.i18n.locale) +
          '&utm_source=new-website&utm_medium=button';
      },
      redirectNotificationsEnabled() {
        return this.$config.ENABLE_LINKS_TO_CLASSIC;
      },
      relatedCollectionsEnabled() {
        return this.$config.ENABLE_SEARCH_RELATED_COLLECTIONS;
      }
    },

    mounted() {
      this.$store.commit('search/enableCollectionFacet');
    },

    head() {
      return {
        title: this.$t('search')
      };
    },

    async beforeRouteLeave(to, from, next) {
      await this.$store.dispatch('search/deactivate');
      next();
    },

    watchQuery: ['api', 'reusability', 'query', 'qf', 'page']
  };
</script>
