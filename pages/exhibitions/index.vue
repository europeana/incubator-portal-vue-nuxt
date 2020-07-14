<template>
  <b-container
    data-qa="exhibitions"
  >
    <ContentHeader
      :title="$tc('exhibitions.exhibitions', 2)"
      :description="$t('exhibitions.description')"
    />
    <b-row class="flex-md-row pb-5">
      <b-col cols="12">
        <b-card-group
          class="card-deck-4-cols"
          deck
          data-qa="exhibitions section"
        >
          <ContentCard
            v-for="exhibition in exhibitions"
            :key="exhibition.identifier"
            :title="exhibition.name"
            :url="{ name: 'exhibitions-exhibition', params: { exhibition: exhibition.identifier } }"
            :image-url="imageUrl(exhibition.primaryImageOfPage)"
            :image-content-type="imageContentType(exhibition.primaryImageOfPage)"
            :image-optimisation-options="{ width: 510 }"
            :texts="[exhibition.description]"
          />
        </b-card-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <PaginationNav
          v-if="showPagination"
          v-model="page"
          :limit="perPage"
          :total-results="total"
          :per-page="perPage"
          :link-gen="paginationLink"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import ContentHeader from '../../components/generic/ContentHeader';
  import ContentCard from '../../components/generic/ContentCard';
  import PaginationNav from '../../components/generic/PaginationNav';
  import { pageFromQuery } from '../../plugins/utils';

  const PER_PAGE = 20;

  export default {
    name: 'ExhibitionFoyer',
    components: {
      ContentHeader,
      ContentCard,
      PaginationNav
    },
    asyncData({ query, redirect, error, app }) {
      const currentPage = pageFromQuery(query.page);
      if (currentPage === null) {
        // Redirect non-positive integer values for `page` to `page=1`
        query.page = '1';
        return redirect(app.$path({ name: 'exhibitions', query }));
      }

      const variables = {
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview',
        limit: PER_PAGE,
        skip: (currentPage - 1) * PER_PAGE
      };

      return app.$contentful.query('exhibitionFoyerPage', variables)
        .then(response => response.data.data)
        .then(data => {
          return {
            exhibitions: data.exhibitionPageCollection.items,
            total: data.exhibitionPageCollection.total,
            page: currentPage,
            perPage: PER_PAGE
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },
    data() {
      return {
        perPage: PER_PAGE,
        page: null
      };
    },
    computed: {
      showPagination() {
        return this.total > this.perPage;
      }
    },
    methods: {
      paginationLink(val) {
        return this.$path({ name: 'exhibitions', query: { page: val } });
      },
      imageUrl(image) {
        if (image && image.image) return image.image.url;
      },
      imageContentType(image) {
        if (image && image.image) return image.image.contentType;
      }
    },
    head() {
      return {
        title: this.$tc('exhibitions.exhibitions', 2)
      };
    },
    watchQuery: ['page'],
    beforeRouteLeave(to, from, next) {
      this.$store.commit('breadcrumb/clearBreadcrumb');
      next();
    }
  };
</script>
