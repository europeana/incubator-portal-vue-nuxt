<template>
  <b-container
    v-if="relatedCollections.length > 0"
    data-qa="related collections"
  >
    <h2 class="related-heading text-uppercase mt-4 mb-2">
      {{ $t('relatedCollections') }}
    </h2>
    <RelatedChip
      v-for="relatedCollection in relatedCollections"
      :id="relatedCollection.id"
      :key="relatedCollection.id"
      :link-gen="suggestionLinkGen"
      :title="relatedCollection.prefLabel[$i18n.locale]"
    />
  </b-container>
</template>

<script>
  import RelatedChip from './RelatedChip';
  import { getEntitySuggestions, getEntityTypeHumanReadable, getEntitySlug } from '../../plugins/europeana/entity';
  import { mapGetters } from 'vuex';

  export default {
    name: 'RelatedCollections',

    components: {
      RelatedChip
    },

    props: {
      query: {
        type: String,
        default: ''
      }
    },

    fetch() {
      this.getSearchSuggestions(this.query);
    },

    data() {
      return {
        relatedCollections: []
      };
    },

    computed: {
      ...mapGetters({
        apiConfig: 'apis/config'
      })
    },

    watch: {
      query: '$fetch'
    },

    methods: {
      async getSearchSuggestions(query) {
        this.relatedCollections = query === '' ? [] : await getEntitySuggestions(query, {
          language: this.$i18n.locale,
          rows: 4
        });
      },

      suggestionLinkGen(id, prefLabel) {
        const uriMatch = id.match(`^${this.apiConfig.data.origin}/([^/]+)(/base)?/(.+)$`);
        return this.$path({
          name: 'collections-type-all', params: {
            type: getEntityTypeHumanReadable(uriMatch[1]),
            pathMatch: getEntitySlug(id, prefLabel)
          }
        });
      }
    }
  };
</script>
