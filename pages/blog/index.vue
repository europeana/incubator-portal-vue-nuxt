<template>
  <b-container data-qa="blog">
    <ContentHeader
      :title="$t('blog.blog')"
    />
    <b-row class="flex-md-row pb-5">
      <b-col cols="12">
        <b-card-group
          class="card-deck-4-cols"
          deck
          data-qa="blog posts section"
        >
          <ContentCard
            v-for="(post, index) in posts"
            :key="index"
            :title="post.fields.name"
            :url="{ name: 'blog-all', params: { pathMatch: post.fields.identifier } }"
            :image-url="post.fields.primaryImageOfPage && post.fields.primaryImageOfPage.fields.image.fields.file.url"
            :texts="[post.fields.description]"
            :datetime="post.fields.datePublished"
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
  import createClient from '../../plugins/contentful';
  import ContentCard from '../../components/generic/ContentCard';
  import { pageFromQuery } from '../../plugins/utils';

  const PER_PAGE = 20;

  export default {
    name: 'BlogFoyer',
    components: {
      ContentHeader,
      ContentCard,
      PaginationNav: () => import('../../components/generic/PaginationNav')
    },

    head() {
      return {
        title: this.$t('blog.blog')
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
        return redirect(app.$path({ name: 'blog', query }));
      }

      const contentfulClient = createClient(query.mode);
      return contentfulClient.getEntries({
        'locale': app.i18n.isoLocale(),
        'content_type': 'blogPosting',
        'skip': (currentPage - 1) * PER_PAGE,
        'order': '-fields.datePublished',
        limit: PER_PAGE
      })
        .then((response) => {
          return {
            posts: response.items,
            total: response.total,
            perPage: PER_PAGE
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },

    methods: {
      paginationLink(val) {
        return this.$path({ name: 'blog', query: { page: val } });
      }
    },

    watchQuery: ['page']
  };
</script>
