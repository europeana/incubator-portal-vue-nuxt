<template>
  <div
    v-if="topics.length > 0"
  >
    <ContentCardSection
      :section="contentCardSection"
    />
  </div>
</template>

<script>
  import ContentCardSection from '../browse/ContentCardSection';

  export default {
    name: 'HighlightedEntities',

    components: {
      ContentCardSection
    },

    fetch() {
      if (process.server) {
        return require('@/server-middleware/api/entities/topics')
          .topicsOfTheDay(this.$config)
          .then(topics => {
            this.topics = topics;
          });
      } else {
        return this.$axios.get('/_api/entities/topics')
          .then(response => {
            this.topics = response.data;
          });
      }
    },

    data: () => ({
      topics: []
    }),

    computed: {
      contentCardSection() {
        return {
          headline: 'Highlighted topics',
          hasPartCollection: {
            items: this.topics.map(topic => ({
              __typename: 'AutomatedEntityCard',
              name: topic.prefLabel,
              identifier: topic.id,
              image: topic.isShownBy?.thumbnail
            }))
          }
        };
      }
    }
  };
</script>
