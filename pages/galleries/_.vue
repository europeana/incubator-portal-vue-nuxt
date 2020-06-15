<template>
  <b-container>
    <ContentHeader
      :title="title"
      :description="htmlDescription"
      :media-url="shareMediaUrl"
    />
    <b-row class="flex-md-row pb-5">
      <b-col cols="12">
        <b-card-group
          class="masonry"
          deck
          data-qa="gallery images"
        >
          <client-only>
            <ContentCard
              v-for="image in images"
              :key="image.fields.identifier"
              :title="imageTitle(image)"
              :image-url="imageUrl(image)"
              :lazy="false"
              :url="{ name: 'item-all', params: { pathMatch: image.fields.identifier.slice(1) } }"
            />
          </client-only>
        </b-card-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import ClientOnly from 'vue-client-only';
  import createClient from '../../plugins/contentful';
  import ContentHeader from '../../components/generic/ContentHeader';

  import marked from 'marked';

  export default {
    name: 'ImageGallery',
    components: {
      ClientOnly,
      ContentHeader,
      ContentCard: () => import('../../components/generic/ContentCard')
    },
    computed: {
      shareMediaUrl() {
        return this.images.length === 0 ? null : this.imageUrl(this.images[0]);
      },
      description() {
        return this.$options.filters.stripMarkdown(this.rawDescription);
      },
      htmlDescription() {
        return marked(this.rawDescription);
      }
    },
    asyncData({ params, query, error, app }) {
      const contentfulClient = createClient(query.mode);

      return contentfulClient.getEntries({
        'locale': app.i18n.isoLocale(),
        'content_type': 'imageGallery',
        'fields.identifier': params.pathMatch
      })
        .then((response) => {
          return {
            rawDescription: response.items[0].fields.description,
            images: response.items[0].fields.hasPart,
            title: response.items[0].fields.name
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },
    methods: {
      imageTitle(data) {
        if (data.sys.contentType.sys.id === 'automatedRecordCard' && data.fields.encoding) {
          if (data.fields.encoding.dcTitleLangAware) {
            return data.fields.encoding.dcTitleLangAware;
          } else if (data.fields.encoding.dcDescriptionLangAware) {
            return data.fields.encoding.dcDescriptionLangAware;
          } else {
            return this.$t('record.record');
          }
        }
        return data.fields.name;
      },
      imageUrl(data) {
        if (data.sys.contentType.sys.id === 'automatedRecordCard' && data.fields.encoding) {
          return `${data.fields.encoding.edmPreview[0]}&size=w200`;
        }
        return data.fields.thumbnailUrl;
      }
    },
    head() {
      return {
        title: this.title,
        meta: [
          { hid: 'title', name: 'title', content: this.title },
          { hid: 'og:title', property: 'og:title', content: this.title },
          { hid: 'og:image', property: 'og:image', content: this.shareMediaUrl },
          { hid: 'og:type', property: 'og:type', content: 'article' }
        ].concat(this.description ? [
          { hid: 'description', name: 'description', content: this.description },
          { hid: 'og:description', property: 'og:description', content: this.description }
        ] : [])
      };
    }
  };
</script>
