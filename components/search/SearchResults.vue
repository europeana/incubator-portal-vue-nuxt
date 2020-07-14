<template>
  <b-card-group
    v-if="view === 'list'"
    data-qa="search results list"
    deck
    class="card-group-list mx-0"
  >
    <ContentCard
      v-for="result in value"
      :key="result.europeanaId"
      :title="result.dcTitle || result.dcDescription"
      :url="{ name: 'item-all', params: { pathMatch: result.europeanaId.slice(1) } }"
      :image-url="result.edmPreview"
      :texts="cardTexts(result, 'list')"
      :hits-text="result.selector"
      data-qa="search result"
      :limit-values-within-each-text="3"
      :omit-all-uris="true"
      variant="list"
      class="mx-0"
    />
  </b-card-group>
  <b-card-group
    v-else
    :class="`card-deck-search masonry card-deck-${perRow}-cols`"
    deck
    data-qa="search results grid"
  >
    <ContentCard
      v-for="result in value"
      :key="result.europeanaId"
      :title="result.dcTitle || result.dcDescription"
      :url="{ name: 'item-all', params: { pathMatch: result.europeanaId.slice(1) } }"
      :image-url="result.edmPreview"
      :show-user-buttons="showUserButtons"
      :texts="cardTexts(result)"
      data-qa="search result"
      :limit-values-within-each-text="3"
      :omit-all-uris="true"
      :blank-image-height="280"
    />
  </b-card-group>
</template>

<script>
  import ContentCard from '../generic/ContentCard';

  export default {
    name: 'SearchResults',

    components: {
      ContentCard
    },

    props: {
      value: {
        type: Array,
        default: () => []
      },
      perRow: {
        type: Number,
        default: 4
      },
      view: {
        type: String,
        default: 'grid'
      }
    },

    data() {
      return {
        activeView: this.view
      };
    },

    computed: {
      showUserButtons() {
        // TODO: can be removed at some point
        return Boolean(Number(process.env.ENABLE_XX_USER_AUTH));
      }
    },

    watch: {
      view() {
        this.activeView = this.view;
      }
    },

    methods: {
      cardTexts(result, variant) {
        const texts = [result.edmDataProvider];
        if (result.dcCreator) texts.unshift(result.dcCreator);

        if (variant === 'list') {
          if (!result.selector && result.dcDescription) texts.unshift(result.dcDescription);
        }

        return texts;
      }
    }
  };
</script>
