<template>
  <div>
    <client-only>
      <VueAnnouncer
        v-if="enableAnnouncer"
        data-qa="vue announcer"
      />
      <CookieDisclaimer />
    </client-only>
    <div
      ref="resetfocus"
      data-qa="top page"
    />
    <a
      class="skip-main"
      href="#main"
      data-qa="main content accessibility link"
    >
      {{ $t('layout.skipToMain') }}
    </a>
    <PageHeader
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

    fetch() {
      const contentfulVariables = {
        locale: this.$i18n.isoLocale(),
        preview: this.$route.query.mode === 'preview'
      };

      return this.$contentful.query('linkGroups', contentfulVariables)
        .then(response => {
          const data = response.data.data;
          const linkGroups = {};
          for (const identifier in data) {
            const linkGroup = data[identifier].items[0];
            linkGroups[identifier] = {
              name: linkGroup.name ? linkGroup.name : null,
              links: linkGroup.links.items
            };
          }
          this.linkGroups = linkGroups;
          if (this.$announcer) this.$announcer.setComplementRoute(this.$t('pageHasLoaded'));
        })
        .catch(() => {
          return;
        });
    },

    fetchOnServer: false,

    data() {
      return {
        ...config,
        linkGroups: {},
        enableAnnouncer: true
      };
    },

    computed: {
      ...mapState({
        breadcrumbs: state => state.breadcrumb.data
      }),
      ...mapGetters({
        canonicalUrl: 'http/canonicalUrl',
        canonicalUrlWithoutLocale: 'http/canonicalUrlWithoutLocale'
      })
    },

    watch: {
      '$i18n.locale': '$fetch',
      $route(to, from) {
        this.$nextTick(() => {
          if (to.path === from.path) {
            this.enableAnnouncer = false;
          } else {
            this.$refs.resetfocus.setAttribute('tabindex', '0');
            this.$refs.resetfocus.focus();
            this.enableAnnouncer = true;
          }
        });
      }

    },

    mounted() {
      this.$announcer.setComplementRoute(this.$t('pageHasLoaded'));
    },

    head() {
      const i18nSeo = this.$nuxtI18nSeo();
      return {
        htmlAttrs: {
          ...i18nSeo.htmlAttrs
        },
        link: [
          { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,700italic,400,600,700&subset=latin,greek,cyrillic&display=swap', body: true },
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
