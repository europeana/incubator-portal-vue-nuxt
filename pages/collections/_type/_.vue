<template>
  <b-container
    data-qa="entity page"
    fluid
    class="entity-page"
  >
    <b-row
      v-if="$fetchState.pending || $fetchState.error"
      class="flex-md-row pt-5 bg-white mb-4"
    >
      <b-col
        cols="12"
      >
        <b-container class="mb-5">
          <LoadingSpinner
            v-if="$fetchState.pending"
          />
          <AlertMessage
            v-else
            :error="$fetchState.error.message"
          />
        </b-container>
      </b-col>
    </b-row>
    <template v-else>
      <b-row class="flex-md-row pt-5 bg-white mb-4">
        <b-col
          cols="12"
        >
          <b-container class="mb-5">
            <EntityDetails
              :description="description"
              :is-editorial-description="hasEditorialDescription"
              :title="title"
            />
            <client-only>
              <section
                v-if="relatedCollectionsFound"
                data-qa="related entities"
              >
                <RelatedCollections
                  :title="$t('collectionsYouMightLike')"
                  :related-collections="relatedEntities ? relatedEntities : relatedCollectionCards"
                />
              </section>
            </client-only>
          </b-container>
        </b-col>
      </b-row>
      <b-row>
        <b-col
          cols="12"
          class="pb-3"
        >
          <client-only>
            <EntityItemSearch
              class="px-0"
              :identifier="entity.id"
              :pref-label="entity.prefLabel"
            />
          </client-only>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-container class="p-0">
            <client-only>
              <BrowseSections
                v-if="page"
                :sections="page.hasPartCollection.items"
              />
            </client-only>
          </b-container>
        </b-col>
      </b-row>
    </template>
  </b-container>
</template>

<script>
  import ClientOnly from 'vue-client-only';
  import AlertMessage from '../../../components/generic/AlertMessage';
  import EntityDetails from '../../../components/entity/EntityDetails';
  import EntityItemSearch from '../../../components/entity/EntityItemSearch';
  import LoadingSpinner from '../../../components/generic/LoadingSpinner';

  import { mapState } from 'vuex';

  import * as entities from '../../../plugins/europeana/entity';
  import { langMapValueForLocale } from  '../../../plugins/europeana/utils';
  import { getEntityTypeHumanReadable, getEntitySlug } from '../../../plugins/europeana/entity';
  import { mapGetters } from 'vuex';

  export default {
    components: {
      AlertMessage,
      BrowseSections: () => import('../../../components/browse/BrowseSections'),
      ClientOnly,
      EntityDetails,
      EntityItemSearch,
      LoadingSpinner,
      RelatedCollections: () => import('../../../components/generic/RelatedCollections')
    },

    middleware: 'sanitisePageQuery',

    fetch() {
      this.$store.commit('search/disableCollectionFacet');
      this.$store.commit('search/disableAutoSuggest');

      return Promise.all([
        this.fetchFromContentful(),
        entities.getEntity(this.$route.params.type, this.$route.params.pathMatch)
      ])
        .then(values => {
          this.entity = values[1].entity;
          this.$store.commit('search/setPill', this.title);
          this.enforcePreferredRoute();
        })
        .catch(e => {
          if (process.server) this.$nuxt.context.res.statusCode = (e.statusCode === undefined) ? 500 : e.statusCode;
          throw e;
        });
    },

    data() {
      return {
        entity: null,
        page: null,
        relatedCollections: [],
        relatedEntities: []
      };
    },

    computed: {
      ...mapGetters({
        apiConfig: 'apis/config'
      }),
      ...mapState({
        curatedEntities: state => state.entity.curatedEntities
      }),
      description() {
        return this.editorialDescription ? { values: [this.editorialDescription], code: null } : null;
      },
      descriptionText() {
        return (this.description && this.description.values.length >= 1) ? this.description.values[0] : null;
      },
      editorialAttribution() {
        return this.page.primaryImageOfPage.url;
      },
      // Depiction from the Contentful entry
      editorialDepiction() {
        try {
          const image = this.page.primaryImageOfPage.image;
          return this.$options.filters.optimisedImageUrl(image.url, image.contentType, { width: 510 });
        } catch (error) {
          if (error instanceof TypeError) {
            return null;
          }
          throw error;
        }
      },
      // Description from the Contentful entry
      editorialDescription() {
        if (!this.hasEditorialDescription) return null;
        return this.page.description;
      },
      hasEditorialDescription() {
        return this.page && this.page.description && this.page.description.length >= 1;
      },
      // Title from the Contentful entry
      editorialTitle() {
        if (!this.page || !this.page.name) return null;
        return this.page.name;
      },
      relatedCollectionCards() {
        return (this.page
          && this.page.relatedLinksCollection
          && this.page.relatedLinksCollection.items
          && this.page.relatedLinksCollection.items.length > 0)
          ? this.page.relatedLinksCollection.items : null;
      },
      relatedCollectionsFound() {
        if (this.relatedEntities && this.relatedEntities.length > 0) {
          return true;
        } else if (this.relatedCollectionCards && this.relatedCollectionCards.length > 0) {
          return true;
        }
        return false;
      },
      title() {
        if (this.$fetchState.error) return { values: [this.$t('error')] };
        if (!this.entity) return this.titleFallback();
        if (this.editorialTitle) return this.titleFallback(this.editorialTitle);
        return langMapValueForLocale(this.entity.prefLabel, this.$store.state.i18n.locale);
      }
    },

    mounted() {
      // TODO: move into a new component's fetch() ?
      if (!this.$fetchState.error && !this.relatedCollectionCards) {
        entities.relatedEntities(this.$route.params.type, this.$route.params.pathMatch, { origin: this.$route.query.recordApi })
          .then((related) => {
            this.relatedEntities = related;
          });
      }
    },

    methods: {
      async fetchFromContentful() {
        const identifier = entities.getEntityUri(this.$route.params.type, this.$route.params.pathMatch);

        // Get all curated entity names & genres and store, unless already stored
        const fetchCuratedEntities = !this.$store.state.entity.curatedEntities;
        // Get the full page for this entity if not known needed, or known to be needed, and store for reuse
        const fetchEntityPage = !this.curatedEntities ||
          this.$store.state.entity.curatedEntities.some(entity => entity.identifier === identifier);

        if (fetchCuratedEntities || fetchEntityPage) {
          const contentfulVariables = {
            identifier,
            locale: this.$i18n.isoLocale(),
            preview: this.$route.query.mode === 'preview',
            curatedEntities: fetchCuratedEntities,
            entityPage: fetchEntityPage
          };

          const collectionPageResponse = await this.$contentful.query('collectionPage', contentfulVariables);

          if (fetchCuratedEntities) this.$store.commit('entity/setCuratedEntities', collectionPageResponse.data.data.curatedEntities.items);
          if (fetchEntityPage) this.page = collectionPageResponse.data.data.entityPage.items[0];
        }
      },
      enforcePreferredRoute() {
        const entityName = this.page ? this.page.name : this.entity.prefLabel.en;
        const desiredPath = entities.getEntitySlug(this.entity.id, entityName);

        if (this.$route.params.pathMatch !== desiredPath) {
          const redirectPath = this.$path({
            name: 'collections-type-all',
            params: { type: this.$route.params.type, pathMatch: encodeURIComponent(desiredPath) }
          });
          return this.$nuxt.context.redirect(302, redirectPath);
        }
      },
      titleFallback(title) {
        return {
          values: [title],
          code: null
        };
      },
      relatedLinkGen(item) {
        let id = '';
        let name = '';
        if (typeof item.id === 'undefined') {
          id = item.identifier;
          name = item.name;
        } else {
          id = item.id;
          name = item.prefLabel.en;
        }
        const uriMatch = id.match(`^${this.apiConfig.data.origin}/([^/]+)(/base)?/(.+)$`);
        return this.$path({
          name: 'collections-type-all', params: {
            type: getEntityTypeHumanReadable(uriMatch[1]),
            pathMatch: getEntitySlug(id, name)
          }
        });
      }
    },

    head() {
      return {
        title: this.title.values[0],
        meta: [
          { hid: 'og:type', property: 'og:type', content: 'article' },
          { hid: 'title', name: 'title', content: this.title.values[0] },
          { hid: 'og:title', property: 'og:title', content: this.title.values[0] }
        ]
          .concat(this.descriptionText ? [
            { hid: 'description', name: 'description', content: this.descriptionText },
            { hid: 'og:description', property: 'og:description', content: this.descriptionText }
          ] : [])
          .concat(this.depiction ? [
            { hid: 'og:image', property: 'og:image', content: this.$options.filters.urlWithProtocol(this.depiction) }
          ] : [])
      };
    },

    async beforeRouteLeave(to, from, next) {
      await this.$store.dispatch('search/deactivate');
      this.$store.commit('search/enableAutoSuggest');
      next();
    }
  };
</script>

<style lang="scss" scoped>
  .entity-page {
    margin-top: -1rem;
    .col-12 > .container {
      padding: 0;
    }
    .related-collections {
      padding: 0;
    }
  }
</style>
