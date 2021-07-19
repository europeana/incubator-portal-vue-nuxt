<template>
  <div>
    <BrowsePage
      v-if="browsePage"
      :name="name"
      :headline="headline"
      :description="description"
      :has-part-collection="hasPartCollection"
      :hero="hero"
      :hero-image="heroImage"
      :recent-items="showRecentItems"
    >
      <NotificationBanner
        v-if="showNotificationBanner"
        :notification-url="notificationUrl"
        :notification-text="$t('linksToClassic.home.text')"
        :notification-link-text="$t('linksToClassic.home.linkText')"
        class="mb-3"
      />
    </BrowsePage>
    <StaticPage
      v-if="staticPage"
      :name="name"
      :description="description"
      :has-part-collection="hasPartCollection"
      :related-links="relatedLinks"
      :hero="hero"
    />
  </div>
</template>

<script>
  import NotificationBanner from '../components/generic/NotificationBanner.vue';
  import BrowsePage from '../components/browse/BrowsePage';
  import StaticPage from '../components/static/StaticPage';

  export default {
    components: {
      NotificationBanner,
      BrowsePage,
      StaticPage
    },

    asyncData({ params, query, error, app }) {
      const variables = {
        identifier: params.pathMatch ? params.pathMatch : 'home',
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview'
      };

      return app.$contentful.query('browseStaticPage', variables)
        .then(response => response.data.data)
        .then(data => {
          if (data.staticPageCollection.items.length > 0) {
            const itemData = data.staticPageCollection.items[0];
            itemData.staticPage = true;
            return itemData;
          } else if (data.browsePageCollection.items.length > 0) {
            const itemData = data.browsePageCollection.items[0];
            itemData.browsePage = true;
            return itemData;
          } else {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return;
          }
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },

    data() {
      return {
        browsePage: false,
        staticPage: false,
        identifier: null,
        name: null,
        headline: null,
        description: null,
        primaryImageOfPage: null,
        image: null,
        hasPartCollection: null,
        relatedLinks: null
      };
    },

    computed: {
      showNotificationBanner() {
        return (
          this.$config.app.features.linksToClassic && this.isHomePage
        );
      },
      isHomePage() {
        return this.identifier === 'home';
      },
      showRecentItems() {
        return this.$config.app.features.recentItems && this.isHomePage;
      },
      notificationUrl() {
        return `https://classic.europeana.eu/portal/${
          this.$store.state.i18n.locale
        }?utm_source=new-website&utm_medium=button`;
      },
      socialMediaImage() {
        // use social media image if set in Contentful, otherwise use hero image
        if (this.image) {
          return this.image;
        } else if (this.heroImage) {
          return this.heroImage.image;
        }
        // No relevant image present, return null
        return null;
      },
      socialMediaImageOptimisedUrl() {
        return this.$options.filters.optimisedImageUrl(this.socialMediaImage.url, this.socialMediaImage.contentType, {
          width: 800,
          height: 800
        });
      },
      socialMediaImageAlt() {
        return this.socialMediaImage.description ? this.socialMediaImage.description : '';
      },
      hero() {
        return this.primaryImageOfPage ? this.primaryImageOfPage : null;
      },
      heroImage() {
        let heroImage = null;

        if (this.hero && this.hero.image) {
          heroImage = this.hero.image;
        }

        return heroImage;
      }
    },

    head() {
      return {
        title: this.$pageHeadTitle(this.name),
        meta: [
          { hid: 'og:type', property: 'og:type', content: 'article' },
          { hid: 'title', name: 'title', content: this.name },
          { hid: 'og:title', property: 'og:title', content: this.name }
        ].concat(this.description ? [
          { hid: 'description', name: 'description', content: this.description },
          { hid: 'og:description', property: 'og:description', content: this.description }
        ] : []).concat(this.socialMediaImage ? [
          { hid: 'og:image', property: 'og:image', content: this.socialMediaImageOptimisedUrl },
          { hid: 'og:image:alt', property: 'og:image:alt', content: this.socialMediaImageAlt }
        ] : [])
      };
    }
  };
</script>
