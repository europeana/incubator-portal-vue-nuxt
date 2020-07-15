<template>
  <div>
    <client-only>
      <CookieDisclaimer />
    </client-only>
    <a
      class="skip-main"
      href="#main"
      data-qa="main content accessibility link"
    >
      {{ $t('layout.skipToMain') }}
    </a>
    <PageHeader
      :enable-auto-suggest="enableAutoSuggest"
      :main-navigation="linkGroups.mainNavigation"
      :mobile-navigation="linkGroups.mobileNavigation"
      keep-alive
    />
    <main
      id="default"
      role="main"
    >
      <b-breadcrumb
        v-if="breadcrumbs"
        :items="breadcrumbs"
        class="mb-5"
      />
      <nuxt
        id="main"
      />
    </main>
    <client-only>
      <PageFooter
        :help-navigation="linkGroups.footerHelp"
        :more-info-navigation="linkGroups.footerMoreInfo"
      />
    </client-only>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ClientOnly from 'vue-client-only';
  import PageHeader from '../components/PageHeader';

  const config = {
    bootstrapVersion: require('bootstrap/package.json').version,
    bootstrapVueVersion: require('bootstrap-vue/package.json').version
  };

  export default {
    components: {
      ClientOnly,
      CookieDisclaimer: () => import('../components/generic/CookieDisclaimer'),
      PageHeader,
      PageFooter: () => import('../components/PageFooter')
    },

    async fetch() {
      const contentfulVariables = {
        locale: this.$i18n.isoLocale(),
        preview: this.$route.query.mode === 'preview'
      };

      let data;
      try {
        const response = await this.$contentful.query('linkGroups', contentfulVariables);
        data = response.data;
      } catch (e) {
        return;
      }

      const linkGroups = {};
      for (const identifier in data.data) {
        const linkGroup = data.data[identifier].items[0];
        linkGroups[identifier] = {
          name: linkGroup.name ? linkGroup.name : null,
          links: linkGroup.links.items
        };
      }
      this.linkGroups = linkGroups;
    },

    data() {
      return {
        ...config,
        linkGroups: {}
      };
    },

    computed: {
      ...mapState({
        breadcrumbs: state => state.breadcrumb.data
      }),
      ...mapGetters({
        canonicalUrl: 'http/canonicalUrl',
        canonicalUrlWithoutLocale: 'http/canonicalUrlWithoutLocale'
      }),
      enableAutoSuggest() {
        // Auto suggest on search form will be disabled on entity pages.
        return !(this.$store.state.entity && this.$store.state.entity.id);
      }
    },

    watch: {
      '$i18n.locale': '$fetch'
    },

    head() {
      const i18nSeo = this.$nuxtI18nSeo();
      return {
        htmlAttrs: {
          ...i18nSeo.htmlAttrs
        },
        link: [
          { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Ubuntu:300,400,700%7COpen+Sans:400italic,700italic,400,600,700&subset=latin,greek,cyrillic&display=swap', body: true },
          { rel: 'stylesheet', href: `https://unpkg.com/bootstrap@${this.bootstrapVersion}/dist/css/bootstrap.min.css` },
          { rel: 'stylesheet', href: `https://unpkg.com/bootstrap-vue@${this.bootstrapVueVersion}/dist/bootstrap-vue.min.css` },
          { hreflang: 'x-default', rel: 'alternate', href: this.canonicalUrlWithoutLocale },
          ...i18nSeo.link
        ],
        meta: [
          { hid: 'description', property: 'description', content: 'Europeana' },
          { hid: 'og:url', property: 'og:url', content: this.canonicalUrl },
          ...i18nSeo.meta
        ]
      };
    }
  };
</script>
