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
            :show-subtitle="false"
          />
        </b-card-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <PaginationNav
          v-model="page"
          :limit="perPage"
          :total-results="total"
          :per-page="perPage"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import ContentHeader from '../../components/generic/ContentHeader';
  import ContentCard from '../../components/generic/ContentCard';

  const PER_PAGE = 20;

  export default {
    name: 'GalleryFoyer',
    components: {
      ContentHeader,
      ContentCard,
      PaginationNav: () => import('../../components/generic/PaginationNav')
    },
    middleware: 'sanitisePageQuery',
    asyncData({ query, error, app, store }) {
      const variables = {
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview',
        limit: PER_PAGE,
        skip: (store.state.sanitised.page - 1) * PER_PAGE
      };

      return app.$contentful.query('galleryFoyerPage', variables)
        .then(response => response.data.data)
        .then(data => {
          return {
            galleries: data.imageGalleryCollection.items,
            total: data.imageGalleryCollection.total,
            page: store.state.sanitised.page,
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
    methods: {
      imageUrl(data) {
        if (!data.encoding) return '';
        return data.encoding.edmPreview[0] + '&size=w400';
      }
    },
    head() {
      return {
        title: this.$pageHeadTitle(this.$tc('galleries.galleries', 2))
      };
    },
    watchQuery: ['page']
  };
</script>
