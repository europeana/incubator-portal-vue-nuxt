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
      :header="page.name"
      :lead="page.headline"
      :rights-statement="hero.license"
      :name="hero.name"
      :provider="hero.provider"
      :creator="hero.creator"
      :url="hero.url"
    />
    <b-container>
      <ContentHeader
        v-if="!hero"
        :title="page.name"
        :description="page.headline"
      />
      <BrowseSections
        v-if="page"
        :sections="page.hasPart"
      />
    </b-container>
  </div>
</template>

<script>
  import ContentHeader from '../components/generic/ContentHeader';
  import BrowseSections from '../components/browse/BrowseSections';
  import HeroImage from '../components/generic/HeroImage';
  import NotificationBanner from '../components/generic/NotificationBanner.vue';
  import createClient from '../plugins/contentful';

  export default {
    components: {
      ContentHeader,
      BrowseSections,
      NotificationBanner,
      HeroImage
    },
    computed: {
      hero() {
        return this.page.primaryImageOfPage ? this.page.primaryImageOfPage.fields : null;
      },
      heroImage() {
        return this.hero ? this.hero.image.fields.file : null;
      },
      onHomePage() {
        return this.$config.ENABLE_LINKS_TO_CLASSIC && !this.path;
      },
      notificationUrl() {
        return `https://classic.europeana.eu/portal/${this.$store.state.i18n.locale}?utm_source=new-website&utm_medium=button`;
      }
    },
    asyncData({ params, query, error, app }) {
      const contentfulClient = createClient(query.mode);

      // fetch the browsePage data, include set to 2 in order to get nested card data
      return contentfulClient.getEntries({
        'locale': app.i18n.isoLocale(),
        'content_type': 'browsePage',
        'fields.identifier': params.pathMatch ? params.pathMatch : 'home',
        'include': 2,
        'limit': 1
      })
        .then((response) => {
          if (response.total === 0) {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return;
          }
          return {
            page: response.items[0].fields,
            path: params.pathMatch
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },
    head() {
      return {
        title: this.page.name,
        meta: [
          { hid: 'og:type', property: 'og:type', content: 'article' },
          { hid: 'title', name: 'title', content: this.page.name },
          { hid: 'og:title', property: 'og:title', content: this.page.name }
        ].concat(this.page.description ? [
          { hid: 'description', name: 'description', content: this.page.description },
          { hid: 'og:description', property: 'og:description', content: this.page.description }
        ] : []).concat(this.heroImage ? [
          { hid: 'og:image', property: 'og:image', content: this.$options.filters.urlWithProtocol(this.heroImage.url) }
        ] : [])
      };
    }
  };
</script>
