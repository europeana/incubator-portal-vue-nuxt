<template>
  <b-container data-qa="blog post">
    <b-row class="flex-md-row pb-5">
      <b-col
        cols="12"
        md="9"
      >
        <HeroImage
          v-if="hero"
          :image-url="heroImage.url"
          :image-content-type="heroImage.contentType"
          :rights-statement="hero.license"
          :name="hero.name"
          :provider="hero.provider"
          :creator="hero.creator"
          :url="hero.url"
        />
        <BlogPost
          :date-published="page.datePublished"
          :title="page.name"
          :body="page.articleBody"
        />
        <BlogTags
          v-if="page.keywords"
          :tags="page.keywords"
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
          v-if="page.author"
          :authors="page.author"
        />
        <BlogCategories
          v-if="page.genre"
          :categories="page.genre"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import { mapGetters } from 'vuex';
  import createClient from '../../plugins/contentful';
  import BlogPost from '../../components/blog/BlogPost';

  export default {
    components: {
      BlogPost,
      BlogTags: () => import('../../components/blog/BlogTags'),
      BlogAuthors: () => import('../../components/blog/BlogAuthors'),
      BlogCategories: () => import('../../components/blog/BlogCategories'),
      HeroImage: () => import('../../components/generic/HeroImage')
    },

    data() {
      return {
        error: null
      };
    },

    computed: {
      hero() {
        return this.page.primaryImageOfPage ? this.page.primaryImageOfPage.fields : null;
      },
      heroImage() {
        return this.hero ? this.hero.image.fields.file : null;
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
        title: this.page.name,
        meta: [
          { hid: 'title', name: 'title', content: this.page.name },
          { hid: 'og:title', property: 'og:title', content: this.page.name }
        ].concat(this.page.description ? [
          { hid: 'description', name: 'description', content: this.page.description },
          { hid: 'og:description', property: 'og:description', content: this.page.description }
        ] : [])
      };
    },

    asyncData({ params, query, error, app, store }) {
      const contentfulClient = createClient(query.mode);

      return contentfulClient.getEntries({
        'locale': app.i18n.isoLocale(),
        'content_type': 'blogPosting',
        'fields.identifier': params.pathMatch,
        'limit': 1
      })
        .then((response) => {
          if (response.total === 0) {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return;
          }
          store.commit('breadcrumb/setBreadcrumbs', [
            {
              // TODO: Add named language aware route for blog index
              text:  app.i18n.t('blog.blog'),
              to: '/blog'
            },
            {
              text: response.items[0].fields.name,
              active: true
            }
          ]);

          return {
            page: response.items[0].fields
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },

    beforeRouteLeave(to, from, next) {
      this.$store.commit('breadcrumb/clearBreadcrumb');
      next();
    }
  };
</script>
