<template>
  <RelatedCollections
    :title="$t('collectionsYouMightLike')"
    :related-collections="relatedCollections"
  />
</template>

<script>
  import RelatedCollections from '../generic/RelatedCollections';

  export default {
    name: 'RelatedSection',

    components: {
      RelatedCollections
    },

    props: {
      query: {
        type: String,
        default: null
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

    watch: {
      query: '$fetch'
    },

    methods: {
      getSearchSuggestions(query) {
        if (!query) {
          return;
        }
        this.$apis.entity.getEntitySuggestions(query, {
          language: this.$i18n.locale,
          rows: 4
        })
          .then(response => (this.relatedCollections = response));
      }
    }
  };
</script>
