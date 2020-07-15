<template>
  <section
    v-if="section"
    class="browse-section row mb-5"
    data-qa="browse section"
  >
    <div class="col-12 col-lg-9">
      <h2
        data-qa="section headline"
      >
        {{ section.headline }}
      </h2>
      <p>
        {{ section.text }}
      </p>
    </div>
    <div class="col-12">
      <b-card-group
        class="card-deck-4-cols"
        deck
        data-qa="section group"
      >
        <template v-if="!isPeopleSection">
          <BrowseContentCard
            v-for="(card, index) in cards"
            :key="index"
            :fields="card"
            :card-type="card && card['__typename']"
          />
        </template>
        <template v-else>
          <ContentCard
            v-for="(card, index) in cards"
            :key="index"
            :title="card.name"
            :url="entityRouterLink(card.identifier, card.slug)"
            :image-url="card.image"
            :image-optimisation-options="{ width: 510 }"
            variant="mini"
          />
        </template>
      </b-card-group>
      <SmartLink
        v-if="section.moreButton"
        :destination="section.moreButton.url"
        class="btn btn-light"
        data-qa="section more button"
      >
        {{ section.moreButton.text }}
      </SmartLink>
    </div>
  </section>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { entityParamsFromUri, getEntityTypeHumanReadable } from '../../plugins/europeana/entity';
  import ContentCard from '../generic/ContentCard';
  import BrowseContentCard from './BrowseContentCard';
  import SmartLink from '../generic/SmartLink';

  export default {
    components: {
      BrowseContentCard,
      ContentCard,
      SmartLink
    },
    props: {
      section: {
        type: Object,
        default: () => {}
      }
    },
    computed: {
      ...mapGetters({
        apiConfig: 'apis/config'
      }),

      cards() {
        return this.section.hasPartCollection.items;
      },

      isPeopleSection() {
        if (this.cards.length !== 4) return false;
        return this.cards.every((card) => {
          if (card['__typename'] !== 'AutomatedEntityCard') return false;
          const identifier = card.identifier;
          return identifier ? entityParamsFromUri(identifier).type === 'person' : false;
        });
      }
    },
    methods: {
      entityRouterLink(uri, slug) {
        const uriMatch = uri.match(`^${this.apiConfig.data.origin}/([^/]+)(/base)?/(.+)$`);
        return {
          name: 'collections-type-all', params: { type: getEntityTypeHumanReadable(uriMatch[1]), pathMatch: slug ? slug : uriMatch[3] }
        };
      }
    }
  };
</script>

<style lang="scss" scoped>

@import './assets/scss/variables.scss';

.browse-section {
  h2,
  p {
    color: $mediumgrey;
    text-align: left;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 0.12125rem;
  }

  p {
    letter-spacing: 0.0975rem;
    line-height: 1.5;
  }
}

</style>
