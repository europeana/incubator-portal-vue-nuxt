<template>
  <div
    v-if="items.length > 0"
  >
    <ContentCardSection
      :section="contentCardSection"
    />
  </div>
</template>

<script>
  import ContentCardSection from '../browse/ContentCardSection';

  export default {
    name: 'RecentItems',

    components: {
      ContentCardSection
    },

    fetch() {
      if (process.server) {
        return require('@/server-middleware/api/items/recent')
          .recentItems(this.$config)
          .then(items => {
            this.items = items;
          });
      } else {
        return this.$axios.get('/_api/items/recent')
          .then(response => {
            this.items = response.data;
          });
      }
    },

    data: () => ({
      items: []
    }),

    computed: {
      contentCardSection() {
        return {
          headline: 'Recent items',
          hasPartCollection: {
            items: this.items.map(item => ({
              __typename: 'AutomatedRecordCard',
              encoding: item
            }))
          }
        };
      }
    }
  };
</script>
