<template>
  <div
    data-qa="exhibition chapter"
    class="exhibition-page mx-auto figure-attribution"
  >
    <b-container
      fluid
      class="image-wrapper mb-5"
    >
      <h1>{{ page.name }}</h1>
      <p class="lead">
        {{ page.headline }}
      </p>
      <SocialShare
        :media-url="heroImage.url"
      />
    </b-container>
    <ImageWithAttribution
      :src="heroImage.url"
      :image-content-type="heroImage.contentType"
      :rights-statement="hero.license"
      :attribution="hero"
      hero
    />
    <b-container>
      <b-row>
        <b-col
          cols="12"
          class="pb-0 pb-lg-3"
        >
          <h1
            v-if="!hero"
            data-qa="exhibition chapter title"
          >
            {{ page.name }}
          </h1>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <BrowseSections
            v-if="page"
            :sections="page.hasPartCollection.items"
            :rich-text-is-card="false"
            class="exhibition-sections"
          />
        </b-col>
      </b-row>
      <client-only>
        <b-row v-if="chapters">
          <b-col class="my-3">
            <ExhibitionChaptersNavigation
              :exhibition-identifier="exhibitionIdentifier"
              :chapter-navigation="chapterNavigation"
            />
            <h2 class="is-size-1-5">
              {{ $t('exhibitions.chapters') }}
            </h2>
            <ExhibitionChapters
              :exhibition-identifier="exhibitionIdentifier"
              :chapters="chapters"
              :credits="credits"
            />
          </b-col>
        </b-row>
      </client-only>
    </b-container>
  </div>
</template>

<script>
  import ClientOnly from 'vue-client-only';
  import BrowseSections from '../../../components/browse/BrowseSections';
  import ExhibitionChapters from '../../../components/exhibition/ExhibitionChapters';
  import ExhibitionChaptersNavigation from '../../../components/exhibition/ExhibitionChaptersNavigation';

  export default {
    components: {
      BrowseSections,
      ClientOnly,
      ExhibitionChapters,
      ExhibitionChaptersNavigation,
      ImageWithAttribution: () => import('../../../components/generic/ImageWithAttribution'),
      SocialShare: () => import('../../../components/generic/SocialShare')
    },
    asyncData({ params, query, error, app, store }) {
      const variables = {
        identifier: params.exhibition,
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview'
      };

      return app.$contentful.query('exhibitionChapterPage', variables)
        .then(response => response.data.data)
        .then(data => {
          let chapter;
          let exhibition;

          if (data.exhibitionPageCollection.total === 1) {
            exhibition = data.exhibitionPageCollection.items[0];
            chapter = exhibition.hasPartCollection.items.find(item => item.identifier === params.chapter);
          }

          if (!chapter || !exhibition) {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return;
          }

          store.commit('breadcrumb/setBreadcrumbs', [
            {
              text: app.i18n.tc('exhibitions.exhibitions', 2),
              to: app.$path({ name: 'exhibitions' })
            },
            {
              text: exhibition.name,
              to: app.$path({
                name: 'exhibitions-exhibition',
                params: {
                  exhibition: exhibition.identifier
                }
              })
            },
            {
              text: chapter.name,
              active: true
            }
          ]);
          return {
            chapters: exhibition.hasPartCollection.items,
            credits: exhibition.credits,
            exhibitionIdentifier: params.exhibition,
            page: chapter
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },
    computed: {
      chapterNavigation() {
        return this.chapters.map((chapter) => {
          return {
            identifier: chapter.identifier, name: chapter.name, url: this.chapterUrl(chapter.identifier)
          };
        });
      },
      hero() {
        return this.page.primaryImageOfPage ? this.page.primaryImageOfPage : null;
      },
      heroImage() {
        return this.hero ? this.hero.image : null;
      },
      optimisedImageUrl() {
        return this.$options.filters.optimisedImageUrl(
          this.heroImage.url,
          this.heroImage.contentType,
          { width: 800, height: 800 }
        );
      }
    },
    methods: {
      chapterUrl(identifier) {
        return this.$path({
          name: 'exhibitions-exhibition-chapter',
          params: {
            exhibition: this.exhibitionIdentifier, chapter: identifier
          }
        });
      }
    },
    beforeRouteLeave(to, from, next) {
      this.$store.commit('breadcrumb/clearBreadcrumb');
      next();
    },
    head() {
      return {
        title: this.page.name,
        meta: [
          { hid: 'title', name: 'title', content: this.page.name },
          { hid: 'og:title', property: 'og:title', content: this.page.name },
          { hid: 'og:image', property: 'og:image', content: this.optimisedImageUrl },
          { hid: 'og:type', property: 'og:type', content: 'article' }
        ]
          .concat(this.page.description ? [
            { hid: 'description', name: 'description', content: this.page.description },
            { hid: 'og:description', property: 'og:description', content: this.page.description }
          ] : [])
      };
    }
  };
</script>

<style lang="scss" scoped>

  .exhibition-sections {
    text-align: center;
  }

  /deep/ .exhibition-sections .col {
    margin-left: auto;
    margin-right: auto;
    text-align: left;
  }

  /deep/ figure {
    display: inline-block;
    margin: 0;
    max-width: 100%;

    img {
      max-height: 85vh;
      max-width: 100%;
    }

    &.compare-image-wrapper {
      display: inline-block;
      img {
        max-height: 85vh;
      }
    }
  }

  /deep/ iframe {
    max-height: initial;
    max-width: 100%;
  }

</style>
