<template>
  <div
    data-qa="exhibition page"
    class="exhibition-page mx-auto figure-attribution"
  >
    <b-container
      fluid
      class="image-wrapper mb-5"
    >
      <h1>{{ name }}</h1>
      <p class="lead">
        {{ headline }}
      </p>
      <SocialShare
        :media-url="heroImage.url"
      />
    </b-container>
    <ImageWithAttribution
      :src="heroImage.url"
      :image-content-type="heroImage.contentType"
      :rights-statement="hero.license"
      :attribution="hero"
      hero
    />
    <b-container class="pb-3">
      <b-row>
        <b-col
          cols="12"
          class="pb-0 pb-lg-3"
        >
          <article>
            <!-- eslint-disable vue/no-v-html -->
            <div
              data-qa="exhibition text"
              v-html="mainContent"
            />
            <!-- eslint-enable vue/no-v-html -->
          </article>
        </b-col>
      </b-row>
      <b-row v-if="hasPartCollection">
        <b-col class="my-3">
          <h2 class="is-size-1-5">
            {{ $t('exhibitions.chapters') }}
          </h2>
          <ExhibitionChapters
            :exhibition-identifier="identifier"
            :chapters="hasPartCollection.items"
            :credits="credits"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import marked from 'marked';

  import ExhibitionChapters from '../../../components/exhibition/ExhibitionChapters';

  export default {
    components: {
      ExhibitionChapters,
      ImageWithAttribution: () => import('../../../components/generic/ImageWithAttribution'),
      SocialShare: () => import('../../../components/generic/SocialShare')
    },
    asyncData({ params, query, error, app, store, redirect }) {
      if (params.exhibition === undefined) redirect(app.$path({ name: 'exhibitions' }));

      const variables = {
        identifier: params.exhibition,
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview'
      };

      return app.$contentful.query('exhibitionLandingPage', variables)
        .then(response => response.data.data)
        .then(data => {
          if (data.exhibitionPageCollection.items.length === 0) {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return;
          }

          store.commit('breadcrumb/setBreadcrumbs', [
            {
              text: app.i18n.tc('exhibitions.exhibitions', 2),
              to: app.$path({ name: 'exhibitions' })
            },
            {
              text: data.exhibitionPageCollection.items[0].name,
              active: true
            }
          ]);
          return data.exhibitionPageCollection.items[0];
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },
    computed: {
      hero() {
        return this.primaryImageOfPage ? this.primaryImageOfPage : null;
      },
      heroImage() {
        return this.hero ? this.hero.image : null;
      },
      mainContent() {
        if (this.text === undefined) return;
        return marked(this.text);
      },
      optimisedImageUrl() {
        return this.$options.filters.optimisedImageUrl(
          this.heroImage.url,
          this.heroImage.contentType,
          { width: 800, height: 800 }
        );
      }
    },
    beforeRouteLeave(to, from, next) {
      this.$store.commit('breadcrumb/clearBreadcrumb');
      next();
    },
    head() {
      return {
        title: this.name,
        meta: [
          { hid: 'title', name: 'title', content: this.name },
          { hid: 'og:title', property: 'og:title', content: this.name },
          { hid: 'og:type', property: 'og:type', content: 'article' }
        ].concat(this.description ? [
          { hid: 'description', name: 'description', content: this.description },
          { hid: 'og:description', property: 'og:description', content: this.description }
        ] : []).concat(this.heroImage ? [
          { hid: 'og:image', property: 'og:image', content: this.optimisedImageUrl }
        ] : [])
      };
    }
  };
</script>
