<template>
  <b-container data-qa="blog post">
    <b-row class="flex-md-row pb-5 figure-attribution">
      <b-col
        cols="12"
        md="9"
      >
        <ImageWithAttribution
          v-if="hero"
          :src="heroImage.url"
          :image-content-type="heroImage.contentType"
          :rights-statement="hero.license"
          :attribution="hero"
          hero
        />
        <BlogPost
          :date-published="post.datePublished"
          :title="post.name"
          :body="post.articleBody"
        />
        <BlogTags
          v-if="post.keywords"
          :tags="post.keywords"
        />

        <div
          v-if="enableBlogComments"
          class="card card-body mt-4"
          data-qa="disqus widget"
        >
          <vue-disqus
            :shortname="disqusShortname"
            :identifier="identifier"
            :url="shareUrl"
          />
        </div>
      </b-col>
      <b-col
        cols="12"
        md="3"
        class="pb-3"
      >
        <BlogAuthors
          v-if="post.authorCollection.items.length > 0"
          :authors="post.authorCollection.items"
        />
        <BlogCategories
          v-if="post.genre"
          :categories="post.genre"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import { mapGetters } from 'vuex';
  import BlogPost from '../../components/blog/BlogPost';

  export default {
    components: {
      BlogPost,
      BlogTags: () => import('../../components/blog/BlogTags'),
      BlogAuthors: () => import('../../components/blog/BlogAuthors'),
      BlogCategories: () => import('../../components/blog/BlogCategories'),
      ImageWithAttribution: () => import('../../components/generic/ImageWithAttribution')
    },

    asyncData({ params, query, error, app, store }) {
      const variables = {
        identifier: params.pathMatch,
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview'
      };

      return app.$contentful.query('blogPostPage', variables)
        .then(response => response.data.data)
        .then(data => {
          if (data.blogPostingCollection.items.length === 0) {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return;
          }

          const post = data.blogPostingCollection.items[0];

          store.commit('breadcrumb/setBreadcrumbs', [
            {
              // TODO: Add named language aware route for blog index
              text: app.i18n.t('blog.blog'),
              to: '/blog'
            },
            {
              text: post.name,
              active: true
            }
          ]);

          return {
            post
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },

    data() {
      return {
        error: null
      };
    },

    computed: {
      hero() {
        return this.post.primaryImageOfPage ? this.post.primaryImageOfPage : null;
      },
      heroImage() {
        return this.hero ? this.hero.image : null;
      },

      ...mapGetters({
        shareUrl: 'http/canonicalUrl',
        identifier: 'http/canonicalUrlWithoutLocale'
      }),

      disqusShortname() {
        return this.$config.DISQUS_SHORTNAME;
      },

      enableBlogComments() {
        return !!this.disqusShortname;
      }
    },

    head() {
      return {
        title: this.post.name,
        meta: [
          { hid: 'title', name: 'title', content: this.post.name },
          { hid: 'og:title', property: 'og:title', content: this.post.name }
        ].concat(this.post.description ? [
          { hid: 'description', name: 'description', content: this.post.description },
          { hid: 'og:description', property: 'og:description', content: this.post.description }
        ] : [])
      };
    },

    beforeRouteLeave(to, from, next) {
      this.$store.commit('breadcrumb/clearBreadcrumb');
      next();
    }
  };
</script>
