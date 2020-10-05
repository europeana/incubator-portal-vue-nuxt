<template>
  <SearchInterface
    :per-page="recordsPerPage"
    :route="route"
    :show-content-tier-toggle="false"
  />
</template>

<script>
  import { getEntityQuery } from '../../plugins/europeana/entity';

  import SearchInterface from '../search/SearchInterface';

  export default {
    name: 'EntityItemSearch',

    components: {
      SearchInterface
    },

    props: {
      identifier: {
        type: String,
        required: true
      },

      prefLabel: {
        type: Object,
        default: () => {}
      },

      recordsPerPage: {
        type: Number,
        default: 24
      }
    },

    fetch() {
      this.$store.dispatch('search/activate');

      const userParams = Object.assign({}, this.$route.query);

      const entityUri = this.identifier;

      const overrideParams = {
        qf: [],
        rows: this.recordsPerPage
      };

      const curatedEntity = this.$store.getters['entity/curatedEntity'](entityUri);
      if (curatedEntity && curatedEntity.genre) {
        overrideParams.qf.push(`collection:${curatedEntity.genre}`);
      } else {
        const entityQuery = getEntityQuery(entityUri);
        overrideParams.qf.push(entityQuery);

        if (!userParams.query) {
          const englishPrefLabel = this.englishPrefLabel;
          if (englishPrefLabel) overrideParams.query = englishPrefLabel;
        }
      }

      this.$store.commit('search/set', ['userParams', userParams]);
      this.$store.commit('search/set', ['overrideParams', overrideParams]);

      return this.$store.dispatch('search/run');
    },

    computed: {
      route() {
        return {
          name: 'collections-type-all',
          params: {
            type: this.$route.params.type,
            pathMatch: this.$route.params.pathMatch
          }
        };
      },

      englishPrefLabel() {
        return (!this.prefLabel || !this.prefLabel.en) ? null : this.prefLabel.en;
      }
    },

    watch: {
      '$route.query': '$fetch'
    }
  };
</script>
