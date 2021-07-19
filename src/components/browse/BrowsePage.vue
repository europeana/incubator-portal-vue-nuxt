<template>
  <div data-qa="browse page">
    <slot />
    <HeroHeader
      v-if="heroImage"
      :hero-image="heroImage"
      :title="heroTitle"
      :description="heroDescription"
      :cta="heroCta"
    />
    <b-container>
      <ContentHeader
        v-if="!hero"
        :title="name"
        :description="headline"
      />
      <BrowseSections :sections="hasPartCollection.items" />
      <RecentItems
        v-if="recentItems"
      />
    </b-container>
  </div>
</template>

<script>
  import ContentHeader from '../generic/ContentHeader';
  import BrowseSections from '../browse/BrowseSections';
  import HeroHeader from '../browse/HeroHeader';

  export default {
    components: {
      ContentHeader,
      BrowseSections,
      HeroHeader,
      RecentItems: () => import('@/components/item/RecentItems')
    },
    props: {
      name: {
        type: String,
        default: null
      },
      headline: {
        type: String,
        default: null
      },
      description: {
        type: String,
        default: null
      },
      hasPartCollection: {
        type: Object,
        default: null
      },
      hero: {
        type: Object,
        default: null
      },
      heroImage: {
        type: Object,
        default: null
      },
      recentItems: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      heroCta() {
        return this.hero && this.hero.link ? this.hero.link : null;
      },
      heroTitle() {
        return this.hero && this.hero.title ? this.hero.title : null;
      },
      heroDescription() {
        return this.hero && this.hero.headline ? this.hero.headline : null;
      }
    }
  };
</script>
