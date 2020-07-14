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
            :title="post.name"
            :url="{ name: 'blog-all', params: { pathMatch: post.identifier } }"
            :image-url="post.primaryImageOfPage && post.primaryImageOfPage.image.url"
            :texts="[post.description]"
            :datetime="post.datePublished"
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
    name: 'BlogFoyer',
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
        return redirect(app.$path({ name: 'blog', query }));
      }

      const variables = {
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview',
        limit: PER_PAGE,
        skip: (currentPage - 1) * PER_PAGE
      };

      return app.$contentful.query('blogFoyerPage', variables)
        .then(response => response.data.data)
        .then(data => {
          return {
            posts: data.blogPostingCollection.items,
            total: data.blogPostingCollection.total,
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
        return this.$path({ name: 'blog', query: { page: val } });
      }
    },

    head() {
      return {
        title: this.$t('blog.blog')
      };
    },

    watchQuery: ['page']
  };
</script>
