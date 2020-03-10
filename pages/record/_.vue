<template>
  <div>
    <NotificationBanner
      v-if="redirectNotificationsEnabled"
      :notification-url="notificationUrl"
      :notification-text="$t('linksToClassic.record.text')"
      :notification-link-text="$t('linksToClassic.record.linkText')"
    />
    <b-container v-if="error">
      <AlertMessage
        :error="error"
      />
    </b-container>
    <b-container
      v-else
      data-qa="record page"
    >
      <b-row class="my-5">
        <b-col
          cols="12"
          lg="9"
        >
          <div class="card px-3 pt-3 mb-3">
            <div
              class="card-grid"
              :class="cardGridClass"
            >
              <header
                v-if="titles"
                class="card-heading"
              >
                <h1
                  :lang="prefTitle.lang"
                >
                  {{ prefTitle.value }}
                </h1>
                <template
                  v-for="(oneAltTitle, index) in altTitles"
                >
                  <p
                    v-for="(altTitleValue, altTitleIndex) in oneAltTitle.value"
                    :key="`${index}.${altTitleIndex}`"
                    :lang="oneAltTitle.lang"
                    class="font-weight-bold"
                  >
                    {{ altTitleValue }}
                  </p>
                </template>
              </header>
              <div class="media-presentation">
                <MediaPresentation
                  :europeana-identifier="identifier"
                  :media="selectedMedia"
                  :image-src="selectedMediaImage.src"
                />
                <MediaThumbnailGrid
                  v-if="displayMediaThumbnailGrid"
                  :media="media"
                  :selected="selectedMedia.about"
                  @select="selectMedia"
                />
              </div>
              <div
                v-if="descriptionInCurrentLanguage"
                class="description"
              >
                <div
                  v-for="(value, index) in descriptionInCurrentLanguage.value"
                  :key="index"
                >
                  <!-- eslint-disable vue/no-v-html -->
                  <p
                    :lang="descriptionInCurrentLanguage.lang"
                    v-html="$options.filters.convertNewLine(value)"
                  />
                  <!-- eslint-disable vue/no-v-html -->
                  <hr
                    v-if="(index + 1) < descriptionInCurrentLanguage.value.length"
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="card p-3 mb-3 bg-grey">
            <MediaActionBar
              :url="selectedMedia.about"
              :europeana-identifier="identifier"
              :use-proxy="useProxy"
              :rights-statement="rightsStatement"
              :data-provider-name="dataProvider.value"
              :data-provider-lang="dataProvider.lang"
              :is-shown-at="isShownAt"
            />
          </div>
          <div
            class="card px-3 pt-3 mb-5 meta-data"
            data-qa="main metadata section"
          >
            <MetadataField
              v-for="(value, name) in coreFields"
              :key="name"
              :name="name"
              :field-data="value"
            />
          </div>
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <h2
                class="mb-3"
              >
                {{ $t('record.extendedInformation') }}
              </h2>
              <b-button
                v-b-toggle.extended-metadata
                class="mb-3 d-inline extended-toggle p-0"
                variant="link"
                @click="toggleExtendedMetadataPreference"
              >
                <span class="extended-opened">{{ $t('record.hideAll') }}</span>
                <span class="extended-closed">{{ $t('record.showAll') }}</span>
              </b-button>
            </div>
            <b-collapse id="extended-metadata">
              <MetadataField
                v-for="(value, name) in fields"
                :key="name"
                :name="name"
                :field-data="value"
                class="mb-3"
              />
            </b-collapse>
          </div>
          <section
            v-if="similarItems.length > 0"
          >
            <h2>{{ $t('record.similarItems') }}</h2>
            <SimilarItems
              :items="similarItems"
              class="mb-3"
            />
          </section>
        </b-col>
        <b-col
          cols="12"
          lg="3"
        >
          <EntityCards
            v-if="relatedEntities"
            :entities="relatedEntities"
            data-qa="related entities"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import axios from 'axios';

  import AlertMessage from '../../components/generic/AlertMessage';
  import EntityCards from '../../components/entity/EntityCards';
  import MediaActionBar from '../../components/record/MediaActionBar';
  import SimilarItems from '../../components/record/SimilarItems';
  import MediaPresentation from '../../components/record/MediaPresentation';
  import MediaThumbnailGrid from '../../components/record/MediaThumbnailGrid';
  import MetadataField from '../../components/record/MetadataField';

  import apiConfig from '../../plugins/europeana/api';
  import getRecord, { similarItemsQuery } from '../../plugins/europeana/record';
  import search from '../../plugins/europeana/search';
  import { isIIIFPresentation, isRichMedia } from '../../plugins/media';
  import { langMapValueForLocale } from  '../../plugins/europeana/utils';
  import { searchEntities } from '../../plugins/europeana/entity';
  import NotificationBanner from '../../components/generic/NotificationBanner';

  export default {
    components: {
      AlertMessage,
      EntityCards,
      MediaActionBar,
      SimilarItems,
      MediaPresentation,
      MediaThumbnailGrid,
      MetadataField,
      NotificationBanner
    },

    data() {
      return {
        agents: null,
        altTitle: null,
        cardGridClass: null,
        concepts: null,
        description: null,
        error: null,
        coreFields: null,
        fields: null,
        identifier: null,
        isShownAt: null,
        media: [],
        relatedEntities: [],
        similarItems: [],
        selectedMediaItem: null,
        useProxy: true,
        title: null,
        type: null
      };
    },

    computed: {
      europeanaAgents() {
        return (this.agents || []).filter((agent) => agent.about.startsWith(`${apiConfig.data.origin}/agent/`));
      },
      europeanaConcepts() {
        return (this.concepts || []).filter((concept) => concept.about.startsWith(`${apiConfig.data.origin}/concept/`));
      },
      europeanaEntityUris() {
        const entities = this.europeanaConcepts.concat(this.europeanaAgents);
        return entities.map((entity) => entity.about).slice(0, 5);
      },
      titles() {
        // let titles = [];

        const mainTitle = langMapValueForLocale(this.title, this.$i18n.locale);
        const alternativeTitle = langMapValueForLocale(this.altTitle, this.$i18n.locale);

        const titles = [].concat(mainTitle, alternativeTitle).filter(Boolean);
        // for (let title of allTitles) {
        //   for (let value of title.values) {
        //     titles.push({ 'code': title.code, value });
        //   }
        // }
        // console.log('titles', titles);
        return titles;
      },
      prefTitle() {
        return this.titles[0];
      },
      altTitles() {
        return this.titles.slice(1);
      },
      descriptionInCurrentLanguage() {
        return langMapValueForLocale(this.description, this.$i18n.locale);
      },
      metaTitle() {
        return this.prefTitle ? this.prefTitle.value : this.$t('record.record');
      },
      metaDescription() {
        // console.log('descriptionInCurrentLanguage', this.descriptionInCurrentLanguage);
        if (!this.descriptionInCurrentLanguage) return null;
        return this.descriptionInCurrentLanguage.value;
      },
      isRichMedia() {
        return isRichMedia(this.selectedMedia, {
          iiif: Number(process.env.ENABLE_IIIF_MEDIA)
        });
      },
      selectedMedia: {
        get() {
          return this.selectedMediaItem || this.media[0] || {};
        },
        set(about) {
          this.selectedMediaItem = this.media.find((item) => item.about === about) || {};
        }
      },
      selectedMediaImage() {
        if (!this.selectedMedia.thumbnails) return {};
        return {
          src: this.selectedMedia.thumbnails.large,
          link: this.isShownAt
        };
      },
      displayMediaThumbnailGrid() {
        // TODO: the IIIF Presentation check may need to account for potentially
        //       some media items being in one Presentation manifest, but
        //       others being, say, audio or video.
        return this.media.length > 1 && !isIIIFPresentation(this.selectedMedia);
      },
      edmRights() {
        return this.selectedMedia.webResourceEdmRights ? this.selectedMedia.webResourceEdmRights : this.fields.edmRights;
      },
      rightsStatement() {
        if (this.edmRights) return langMapValueForLocale(this.edmRights, this.$i18n.locale).value;
        return false;
      },
      dataProvider() {
        const edmDataProvider = langMapValueForLocale(this.coreFields.edmDataProvider, this.$i18n.locale);
        console.log('edmDataProvider', edmDataProvider);

        // FIXME: restore logic; move into utils.js?
        // if (edmDataProvider.value[0].about) {
        //   return edmDataProvider.value[0];
        // }

        return edmDataProvider;
      },
      notificationUrl() {
        return `https://classic.europeana.eu/portal/${this.$i18n.locale}/record${this.identifier}.html?utm_source=new-website&utm_medium=button`;
      },
      redirectNotificationsEnabled() {
        return Boolean(Number(process.env.ENABLE_LINKS_TO_CLASSIC));
      }
    },

    asyncData({ env, params, res, app, redirect, query }) {
      if (env.RECORD_PAGE_REDIRECT_PATH) {
        return redirect(app.localePath({ path: env.RECORD_PAGE_REDIRECT_PATH }));
      }

      return getRecord(`/${params.pathMatch}`, { origin: query.recordApi })
        .then((result) => {
          return result.record;
        })
        .catch((error) => {
          if (typeof res !== 'undefined') {
            res.statusCode = (typeof error.statusCode !== 'undefined') ? error.statusCode : 500;
          }
          return { error: error.message };
        });
    },

    mounted() {
      this.cardGridClass = this.isRichMedia && 'card-grid-richmedia';

      if (process.browser) {
        if (localStorage.itemShowExtendedMetadata && JSON.parse(localStorage.itemShowExtendedMetadata)) {
          this.$root.$emit('bv::toggle::collapse', 'extended-metadata');
        }
      }

      axios.all([
        searchEntities(this.europeanaEntityUris),
        this.getSimilarItems()
      ])
        .then(axios.spread((related, similar) => {
          this.relatedEntities = related;
          this.similarItems = similar.results;
        }));

      window.addEventListener('message', (msg) => {
        if (msg.data.event === 'updateDownloadLink') {
          this.useProxy = (this.media.some((item) => item.about === msg.data.id));
          this.selectedMedia.about = msg.data.id;
        }
      });
    },

    methods: {
      selectMedia(about) {
        this.selectedMedia = about;
      },

      toggleExtendedMetadataPreference() {
        if (process.browser) {
          localStorage.itemShowExtendedMetadata = localStorage.itemShowExtendedMetadata ? !JSON.parse(localStorage.itemShowExtendedMetadata) : true;
        }
      },

      getSimilarItems() {
        const noSimilarItems = { results: [] };
        if (this.error) return noSimilarItems;

        const dataSimilarItems = {
          dcSubject: this.getSimilarItemsData(this.coreFields.dcSubject),
          dcType: this.getSimilarItemsData(this.title),
          dcCreator: this.getSimilarItemsData(this.coreFields.dcCreator),
          edmDataProvider: this.getSimilarItemsData(this.fields.edmDataProvider)
        };

        return search({
          query: similarItemsQuery(this.identifier, dataSimilarItems),
          rows: 4,
          profile: 'minimal',
          facet: ''
        }, {
          origin: this.$route.query.recordApi
        })
          .catch(() => {
            return noSimilarItems;
          });
      },

      getSimilarItemsData(value) {
        if (!value) return;

        const data = langMapValueForLocale(value, this.$i18n.locale);
        if (!data) return;

        return data
          .map(item => item.value)
          .filter(value => typeof value === 'string');
      }
    },

    head() {
      return {
        title: this.metaTitle,
        meta: [
          { hid: 'title', name: 'title', content: this.metaTitle },
          { hid: 'description', name: 'description', content: this.metaDescription },
          { hid: 'og:title', property: 'og:title', content: this.metaTitle },
          { hid: 'og:description', property: 'og:description', content: this.metaDescription },
          { hid: 'og:image', property: 'og:image', content: this.selectedMediaImage.src ? this.selectedMediaImage.src : '' },
          { hid: 'og:type', property: 'og:type', content: 'article' },
          { hid: 'og:url', property: 'og:url', content: this.canonicalUrl }
        ]
      };
    }
  };
</script>

<style lang="scss" scoped>
  @import "./assets/scss/variables.scss";
  @import "./assets/scss/icons.scss";

  h2 {
    font-size: $font-size-medium;
    font-weight: bold;
  }

  .bg-grey {
    background-color: rgba(255, 255, 255, 0.5);
  }

  .card-grid {
    display: grid;
    column-gap: 1rem;
    grid-template-columns: [col1-start] 1fr [col2-start] 1fr [col2-end];
    grid-template-rows: [row1-start] auto [row2-start] auto [row3-start] auto [row3-end];
  }

  .card-heading {
    grid-row: row1-start;
    grid-column: col1-start/col2-end;

    @media (min-width: $bp-large) {
      grid-column: col2-start/col2-end;
    }
  }

  .media-presentation {
    grid-row: row3-start;
    grid-column: col1-start/col2-end;

    @media (min-width: $bp-large) {
      grid-column: col1-start/col2-start;
      grid-row: row1-start/row3-end;
    }
  }

  .description {
    grid-column: col1-start/col2-end;
    grid-row: row2-start;

    @media (min-width: $bp-large) {
      grid-column: col2-start/col2-end;
    }
  }

  .card-grid-richmedia .card-heading {
    grid-column: col1-start/col2-end;
  }

  .card-grid-richmedia .media-presentation {
    grid-column: col1-start/col2-end;
    grid-row: row2-start;
  }

  .card-grid-richmedia .description {
    grid-column: col1-start/col2-end;
    grid-row: row3-start;
  }

  .meta-data {
    > div:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  .collapsed > .extended-opened,
  :not(.collapsed) > .extended-closed {
    display: none;
  }

  .extended-toggle {
    background: transparent;
    border: 0;
    color: $black;
    font-size: 0.875rem;
    text-decoration: none;
    text-transform: uppercase;

    span {
      align-items: center;
      display: flex;
      position: relative;

      &:after {
        content: '\e906';
        border: 1px solid $black;
        display: inline-block;
        font-size: 0.5rem;
        height: 1rem;
        line-height: 1rem;
        margin-left: 1rem;
        text-align: center;
        width: 1rem;
        @extend .icon-font;
      }

      &.extended-closed:after {
        content: '\e907';
      }
    }

    &:hover {
      color: inherit;
    }

    &:before {
      background: $white;
      bottom: -0.5rem;
      left: -0.5rem;
      right: -0.5rem;
      top: -0.5rem;
    }
  }
</style>
