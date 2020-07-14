<template>
  <div
    data-qa="browse page"
  >
    <NotificationBanner
      v-if="onHomePage"
      :notification-url="notificationUrl"
      :notification-text="$t('linksToClassic.home.text')"
      :notification-link-text="$t('linksToClassic.home.linkText')"
      class="mb-3"
    />
    <HeroImage
      v-if="hero"
      :image-url="heroImage.url"
      :image-content-type="heroImage.contentType"
      :header="name"
      :lead="headline"
      :rights-statement="hero.license"
      :name="hero.name"
      :provider="hero.provider"
      :creator="hero.creator"
      :url="hero.url"
    />
    <b-container>
      <ContentHeader
        v-if="!hero"
        :title="name"
        :description="headline"
      />
      <BrowseSections
        :sections="hasPartCollection.items"
      />
    </b-container>
  </div>
</template>

<script>
  import ContentHeader from '../components/generic/ContentHeader';
  import BrowseSections from '../components/browse/BrowseSections';
  import HeroImage from '../components/generic/HeroImage';
  import NotificationBanner from '../components/generic/NotificationBanner.vue';

  export default {
    components: {
      ContentHeader,
      BrowseSections,
      NotificationBanner,
      HeroImage
    },

    asyncData({ params, query, error, app }) {
      const variables = {
        identifier: params.pathMatch ? params.pathMatch : 'home',
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview'
      };

      return app.$contentful.query('browsePage', variables)
        .then(response => response.data.data)
        .then(data => {
          if (data.browsePageCollection.items.length === 0) {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return;
          }

          return data.browsePageCollection.items[0];
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
      onHomePage() {
        return this.$config.ENABLE_LINKS_TO_CLASSIC && (this.identifier === 'home');
      },
      notificationUrl() {
        return `https://classic.europeana.eu/portal/${this.$store.state.i18n.locale}?utm_source=new-website&utm_medium=button`;
      },
      optimisedImageUrl() {
        // use social media image if set in Contentful, otherwise use hero image
        let img = this.image === null ? this.heroImage : this.image;
        return this.$options.filters.optimisedImageUrl(
          img.url,
          img.contentType,
          { width: 800, height: 800 }
        );
      }
    },

    head() {
      return {
        title: this.name,
        meta: [
          { hid: 'og:type', property: 'og:type', content: 'article' },
          { hid: 'title', name: 'title', content: this.name },
          { hid: 'og:title', property: 'og:title', content: this.name }
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
