<template>
  <span>
    {{ label }}
  </span>
</template>

<script>
  export default {
    name: 'FacetFieldLabel',

    props: {
      facetName: {
        type: String,
        required: true
      },

      fieldValue: {
        type: String,
        required: true
      },

      prefixed: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        MIME_TYPE: 'MIME_TYPE',
        DATE: 'proxy_dcterms_issued'
      };
    },

    computed: {
      label() {
        const fieldLabel = (this.facetName === this.MIME_TYPE) ? this.mediaTypeLabel : this.genericLabel;

        if (!this.prefixed) return fieldLabel;

        return this.$t('formatting.labelledValue', { label: this.$tFacetName(this.facetName), value: fieldLabel });
      },

      genericLabel() {
        let fieldLabel;

        fieldLabel = this.$store.getters['search/formatFacetFieldLabel'](this.facetName, this.fieldValue);
        if (!fieldLabel) fieldLabel = this.fieldValue;

        const unquotedFieldValue = fieldLabel.replace(/^"(.*)"$/, '$1');
        const key = `facets.${this.facetName}.options.${unquotedFieldValue}`;

        return this.$tNull(key) || unquotedFieldValue;
      },

      mediaTypeLabel() {
        const translated = this.genericLabel;
        if (translated !== this.fieldValue) return translated;

        let subtype = this.fieldValue.split('/')[1];

        return subtype.replace(/^x-/, '').toUpperCase();
      }
    }
  };
</script>
