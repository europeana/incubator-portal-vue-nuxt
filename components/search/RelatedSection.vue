<template>
  <RelatedCollections
    :title="$t('collectionsYouMightLike')"
    :related-collections="relatedCollections"
  />
</template>

<script>
  import { mapGetters } from 'vuex';

  import RelatedCollections from '../generic/RelatedCollections';

  export default {
    name: 'RelatedSection',

    components: {
      RelatedCollections
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
        this.relatedCollections = query === '' ? [] : await this.$apis.entity.getEntitySuggestions(query, {
          language: this.$i18n.locale,
          rows: 4
        });
      }
    }
  };
</script>
