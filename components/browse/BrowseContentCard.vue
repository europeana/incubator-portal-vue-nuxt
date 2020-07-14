<template>
  <ContentCard
    :title="title"
    :texts="texts"
    :url="destination"
    :image-url="imageUrl"
    :image-content-type="imageContentType"
    :variant="cardVariant"
    :omit-all-uris="true"
    :image-optimisation-options="{ width: 510 }"
  />
</template>

<script>
  import { mapGetters } from 'vuex';

  import ContentCard from '../generic/ContentCard';
  import { getEntityTypeHumanReadable } from '../../plugins/europeana/entity';
  import { isEuropeanaRecordId } from '../../plugins/europeana/record';

  export default {
    components: {
      ContentCard
    },
    props: {
      fields: {
        type: Object,
        default: () => {}
      },
      cardType: {
        type: String,
        default: null
      }
    },
    computed: {
      ...mapGetters({
        apiConfig: 'apis/config'
      }),
      cardFields() {
        return this.cardType === 'AutomatedRecordCard' && this.fields.encoding ? this.fields.encoding : this.fields;
      },
      title() {
        if (this.cardType === 'AutomatedRecordCard' && this.fields.encoding) {
          if (this.cardFields.dcTitleLangAware) {
            return this.cardFields.dcTitleLangAware;
          } else if (this.cardFields.dcDescriptionLangAware) {
            return this.cardFields.dcDescriptionLangAware;
          } else {
            return this.$t('record.record');
          }
        }
        return this.cardFields.name;
      },
      imageIsContentfulAsset() {
        return this.cardFields.image && this.cardFields.image.url && this.cardFields.image.url.includes('://images.ctfassets.net/');
      },
      imageUrl() {
        if (this.cardFields.thumbnailUrl) {
          return this.cardFields.thumbnailUrl;
        } else if (typeof this.cardFields.image === 'string') {
          return this.cardFields.image;
        } else if (this.cardFields.edmPreview) {
          return `${this.cardFields.edmPreview[0]}&size=w200`;
        } else if (this.imageIsContentfulAsset) {
          return this.cardFields.image.url;
        }

        return '';
      },
      imageContentType() {
        return this.imageIsContentfulAsset ? this.cardFields.image.contentType : null;
      },
      destination() {
        if (this.fields.url) {
          return this.fields.url;
        } else if (this.forEuropeanaRecord()) {
          return this.recordRouterLink(this.fields.identifier);
        } else if (typeof this.fields.identifier === 'string' && /^https?:\/\//.test(this.fields.identifier)) {
          if (this.forEuropeanaEntity()) {
            return this.entityRouterLink(this.fields.identifier, this.fields.slug);
          } else {
            return this.fields.identifier;
          }
        }
        return '';
      },
      texts() {
        // TODO: Refactor content model to set this directly, so this method can be skipped.
        let texts = [];
        let textFields;

        if (this.cardType === 'AutomatedRecordCard') {
          if (this.fields.encoding) {
            textFields = ['dcCreatorLangAware', 'dataProvider'];
          } else {
            textFields = ['creator', 'provider'];
          }
        } else {
          textFields = ['description'];
        }

        for (const field of textFields) {
          if (this.cardFields[field]) {
            texts.push(this.cardFields[field]);
          }
        }
        return texts;
      },
      cardVariant() {
        return this.cardType === 'AutomatedEntityCard' ? 'entity' : 'default';
      }
    },
    methods: {
      forEuropeanaRecord() {
        return (typeof this.fields.identifier === 'string') && isEuropeanaRecordId(this.fields.identifier);
      },
      forEuropeanaEntity() {
        return (typeof this.fields.identifier === 'string') && this.fields.identifier.includes(this.apiConfig.data.origin);
      },
      entityRouterLink(uri, slug) {
        const uriMatch = uri.match(`^${this.apiConfig.data.origin}/([^/]+)(/base)?/(.+)$`);
        return {
          name: 'collections-type-all', params: { type: getEntityTypeHumanReadable(uriMatch[1]), pathMatch: slug ? slug : uriMatch[3] }
        };
      },
      recordRouterLink(identifier) {
        return {
          name: 'item-all', params: { pathMatch: identifier.slice(1) }
        };
      }
    }
  };
</script>
