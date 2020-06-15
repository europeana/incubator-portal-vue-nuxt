<template>
  <div
    data-qa="exhibition chapter"
    class="exhibition-page"
  >
    <HeroImage
      v-if="hero"
      :image-url="heroImage.url"
      :image-content-type="heroImage.contentType"
      :header="page.name"
      :lead="page.headline"
      :rights-statement="hero.license"
      :name="hero.name"
      :provider="hero.provider"
      :creator="hero.creator"
      :url="hero.url"
    />
    <b-container>
      <b-row>
        <b-col
          cols="12"
          lg="9"
          class="pb-0 pb-lg-3"
        >
          <h1
            v-if="!hero"
            data-qa="exhibition chapter title"
          >
            {{ page.name }}
          </h1>
          <article>
            {{ page.text }}
          </article>
        </b-col>
        <b-col
          cols="12"
          lg="3"
          class="pb-3 text-left text-lg-right"
        >
          <SocialShare
            :media-url="heroImage.url"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <BrowseSections
            v-if="page"
            :sections="page.hasPart"
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
  import createClient from '../../../plugins/contentful';
  import ClientOnly from 'vue-client-only';
  import BrowseSections from '../../../components/browse/BrowseSections';
  import ExhibitionChapters from '../../../components/exhibition/ExhibitionChapters';
  import ExhibitionChaptersNavigation from '../../../components/exhibition/ExhibitionChaptersNavigation';
  import HeroImage from '../../../components/generic/HeroImage';
  import SocialShare from '../../../components/generic/SocialShare';

  export default {
    components: {
      BrowseSections,
      ClientOnly,
      ExhibitionChapters,
      ExhibitionChaptersNavigation,
      HeroImage,
      SocialShare
    },
    computed: {
      chapterNavigation() {
        return this.chapters.map((chapter) => {
          return {
            identifier: chapter.fields.identifier, name: chapter.fields.name, url: this.chapterUrl(chapter.fields.identifier)
          };
        });
      },
      hero() {
        return this.page.primaryImageOfPage ? this.page.primaryImageOfPage.fields : null;
      },
      heroImage() {
        return this.hero ? this.hero.image.fields.file : null;
      }
    },
    asyncData({ params, query, error, app, store }) {
      const contentfulClient = createClient(query.mode);
      return contentfulClient.getEntries({
        'locale': app.i18n.isoLocale(),
        'content_type': 'exhibitionPage',
        'fields.identifier': params.exhibition,
        'include': 3,
        'limit': 1
      })
        .then((response) => {
          let chapter;
          if (response.total !== 0 && response.items.total !== 0 && response.items[0].fields['hasPart'].total !== 0) {
            chapter = response.items[0].fields['hasPart'].find(c => c && c.fields.identifier === params.chapter);
          }
          if (chapter === undefined) {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return;
          }
          store.commit('breadcrumb/setBreadcrumbs', [
            {
              text:  app.i18n.tc('exhibitions.exhibitions', 2),
              to: app.$path({ name: 'exhibitions' })
            },
            {
              text: response.items[0].fields.name,
              to: app.$path({
                name: 'exhibitions-exhibition',
                params: {
                  exhibition: response.items[0].fields.identifier
                }
              })
            },
            {
              text: chapter.fields.name,
              active: true
            }
          ]);
          return {
            chapters: response.items[0].fields.hasPart,
            credits: response.items[0].fields.credits,
            exhibitionIdentifier: params.exhibition,
            page: chapter.fields
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
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
          { hid: 'og:image', property: 'og:image', content: this.$options.filters.urlWithProtocol(this.heroImage.url) },
          { hid: 'og:type', property: 'og:type', content: 'article' }
        ].concat(this.page.description ? [
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
    margin: 0.5rem 0 1rem 0;
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
