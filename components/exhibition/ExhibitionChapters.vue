<template>
  <section>
    <b-card-group
      :class="`card-deck-search card-deck-4-cols`"
      deck
      data-qa="exhibition chapters"
    >
      <ContentCard
        v-for="chapter in chaptersAndCredits"
        :key="chapter.identifier"
        :title="chapter.name"
        :url="chapterUrl(chapter)"
        :image-url="chapterImageUrl(chapter)"
        :image-content-type="chapterImageContentType(chapter)"
        :image-optimisation-options="{ width: 510 }"
        :texts="[chapterText(chapter)]"
        :data-qa="`exhibitions ${chapter.identifier} card`"
        variant="mini"
      />
    </b-card-group>
  </section>
</template>

<script>
  import ContentCard from '../generic/ContentCard';
  export default {
    components: {
      ContentCard
    },
    props: {
      exhibitionIdentifier: {
        type: String,
        required: true
      },
      chapters: {
        type: Array,
        required: true
      },
      credits: {
        type: String,
        default: null
      }
    },
    computed: {
      currentChapter() {
        return this.$route.name.startsWith('exhibitions-exhibition-credits') ? 'credits' : this.$route.params.chapter;
      },
      chaptersAndCredits() {
        return this.chapters.concat(this.creditsChapter || []);
      },
      creditsChapter() {
        if (!this.credits) return null;
        return {
          name: this.$t('exhibitions.credits'),
          identifier: 'credits'
        };
      }
    },
    methods: {
      chapterUrl(chapter) {
        return chapter.identifier === 'credits' ? {
          name: 'exhibitions-exhibition-credits',
          params: { exhibition: this.exhibitionIdentifier }
        } : {
          name: 'exhibitions-exhibition-chapter',
          params: {
            exhibition: this.exhibitionIdentifier, chapter: chapter.identifier
          }
        };
      },
      chapterText(chapter) {
        return chapter.identifier === this.currentChapter ? this.$t('exhibitions.currentChapter') : '';
      },
      chapterImageUrl(chapter) {
        if (!chapter.primaryImageOfPage) return;
        if (!chapter.primaryImageOfPage.image) return;
        if (!chapter.primaryImageOfPage.image) return;
        return chapter.primaryImageOfPage.image.url;
      },
      chapterImageContentType(chapter) {
        if (!chapter.primaryImageOfPage) return;
        if (!chapter.primaryImageOfPage.image) return;
        if (!chapter.primaryImageOfPage.image) return;
        return chapter.primaryImageOfPage.image.contentType;
      }
    }
  };
</script>
