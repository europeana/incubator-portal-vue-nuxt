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
      :enable-suggestion-validation="enableSuggestionValidation"
    />
    <main role="main">
      <b-container v-if="breadcrumbs">
        <b-row>
          <b-col class="col-12">
            <b-breadcrumb
              :items="breadcrumbs"
              class="px-0"
            />
          </b-col>
        </b-row>
      </b-container>
      <nuxt
        id="main"
      />
    </main>
    <client-only>
      <PageFooter />
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

    data() {
      return {
        ...config,
        enableSuggestionValidation: this.$config.ENABLE_ENTITY_SUGGESTION_RECORD_VALIDATION
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
        // Auto suggest on search form will be disabled unless toggled on by env var,
        // and always disabled on entity pages.
        return this.$config.ENABLE_AUTOSUGGEST && !(this.$store.state.entity && this.$store.state.entity.id);
      }
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
