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
            :key="gallery.fields.identifier"
            :title="gallery.fields.name"
            :url="{ name: 'galleries-all', params: { pathMatch: gallery.fields.identifier } }"
            :image-url="gallery.fields.hasPart[0] && imageUrl(gallery.fields.hasPart[0])"
            :texts="[gallery.fields.description]"
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
  import createClient, { getLinkedItems } from '../../plugins/contentful';
  import { pageFromQuery } from '../../plugins/utils';

  const PER_PAGE = 20;

  export default {
    name: 'GalleryFoyer',
    components: {
      ContentHeader,
      ContentCard,
      PaginationNav: () => import('../../components/generic/PaginationNav')
    },
    head() {
      return {
        title: this.$tc('galleries.galleries', 2)
      };
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
    asyncData({ query, redirect, error, app }) {
      const currentPage = pageFromQuery(query.page);
      if (currentPage === null) {
        // Redirect non-positive integer values for `page` to `page=1`
        query.page = '1';
        return redirect(app.$path({ name: 'galleries', query }));
      }

      const contentfulClient = createClient(query.mode);
      return contentfulClient.getEntries({
        'locale': app.i18n.isoLocale(),
        'content_type': 'imageGallery',
        'skip': (currentPage - 1) * PER_PAGE,
        'order': '-fields.datePublished',
        limit: PER_PAGE,
        include: 0,
        select: 'fields.identifier,fields.name,fields.description,fields.hasPart'
      })
        .then(async(response) => {
          const items = response.items;

          await getLinkedItems(items, 'hasPart', { mode: query.mode });

          return {
            galleries: items,
            total: response.total,
            page: currentPage,
            perPage: PER_PAGE
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },
    methods: {
      paginationLink(val) {
        return this.$path({ name: 'galleries', query: { page: val } });
      },
      imageUrl(data) {
        if (data.sys.contentType.sys.id === 'automatedRecordCard' && data.fields.encoding) {
          return `${data.fields.encoding.edmPreview[0]}&size=w200`;
        }
        return data.fields.thumbnailUrl;
      }
    },
    watchQuery: ['page']
  };
</script>
