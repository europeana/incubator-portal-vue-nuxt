<template>
  <b-container>
    <ContentHeader
      :title="$tc('galleries.galleries', 2)"
      :description="$t('galleries.description')"
    />
    <b-row class="flex-md-row pb-5">
      <b-col cols="12">
        <b-card-group
          class="card-deck-4-cols"
          deck
          data-qa="gallery foyer"
        >
          <ContentCard
            v-for="gallery in galleries"
            :key="gallery.identifier"
            :title="gallery.name"
            :url="{ name: 'galleries-all', params: { pathMatch: gallery.identifier } }"
            :image-url="gallery.hasPartCollection.items[0] && imageUrl(gallery.hasPartCollection.items[0])"
            :texts="[gallery.description]"
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
  import { pageFromQuery } from '../../plugins/utils';

  const PER_PAGE = 20;

  export default {
    name: 'GalleryFoyer',
    components: {
      ContentHeader,
      ContentCard,
      PaginationNav: () => import('../../components/generic/PaginationNav')
    },
    asyncData({ query, redirect, error, app }) {
      const currentPage = pageFromQuery(query.page);
      if (currentPage === null) {
        // Redirect non-positive integer values for `page` to `page=1`
        query.page = '1';
        return redirect(app.$path({ name: 'galleries', query }));
      }

      const variables = {
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview',
        limit: PER_PAGE,
        skip: (currentPage - 1) * PER_PAGE
      };

      return app.$contentful.query('galleryFoyerPage', variables)
        .then(response => response.data.data)
        .then(data => {
          return {
            galleries: data.imageGalleryCollection.items,
            total: data.imageGalleryCollection.total,
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
        return this.$path({ name: 'galleries', query: { page: val } });
      },
      imageUrl(data) {
        return (data.encoding ? data.encoding.edmPreview : data.thumbnailUrl) + '&size=w200';
      }
    },
    head() {
      return {
        title: this.$tc('galleries.galleries', 2)
      };
    },
    watchQuery: ['page']
  };
</script>
