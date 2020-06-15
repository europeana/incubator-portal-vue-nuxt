<template>
  <div
    data-qa="exhibition credits page"
    class="exhibition-page"
  >
    <b-container class="pb-3">
      <b-row>
        <b-col
          cols="12"
          lg="9"
          class="pb-0 pb-lg-3 mt-2"
        >
          <h1>{{ $t('exhibitions.credits') }}</h1>
          <!-- eslint-disable vue/no-v-html -->
          <div
            data-qa="credits text"
            v-html="credits"
          />
          <!-- eslint-enable vue/no-v-html -->
        </b-col>
      </b-row>
      <b-row v-if="page.hasPart">
        <b-col class="my-3">
          <h2 class="is-size-1-5">
            {{ $t('exhibitions.chapters') }}
          </h2>
          <ExhibitionChapters
            :exhibition-identifier="page.identifier"
            :chapters="page.hasPart"
            :credits="page.credits"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import marked from 'marked';
  import createClient from '../../../plugins/contentful';
  import ExhibitionChapters from '../../../components/exhibition/ExhibitionChapters';

  export default {
    components: {
      ExhibitionChapters
    },
    computed: {
      credits() {
        if (this.page.credits === undefined) return false;
        return marked(this.page.credits);
      },
      title() {
        return `${this.page.name} - ${this.$t('exhibitions.credits')}`;
      }
    },
    asyncData({ params, query, error, app, store }) {
      const contentfulClient = createClient(query.mode);
      return contentfulClient.getEntries({
        'locale': app.i18n.isoLocale(),
        'content_type': 'exhibitionPage',
        'fields.identifier': params.exhibition,
        'include': 2,
        'limit': 1
      })
        .then((response) => {
          store.commit('breadcrumb/setBreadcrumbs', [
            {
              text:  app.i18n.tc('exhibitions.exhibitions', 2),
              to: app.$path({ name: 'exhibitions' })
            },
            {
              text: response.items[0].fields.name,
              to: app.$path({
                name: 'exhibitions-exhibition',
                params: {
                  exhibition: response.items[0].fields.identifier
                }
              })
            },
            {
              text: app.i18n.t('exhibitions.credits'),
              active: true
            }
          ]);

          if (response.total === 0) {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return;
          }
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
    },
    head() {
      return {
        title: this.title,
        meta: [
          { hid: 'title', name: 'title', content: this.title },
          { hid: 'og:title', property: 'og:title', content: this.title },
          { hid: 'og:type', property: 'og:type', content: 'article' }
        ]
      };
    }
  };
</script>

<style lang="scss" scoped>
  /deep/ img {
    display: block;
    margin: 1rem 0;
  }
</style>
