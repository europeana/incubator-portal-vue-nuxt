<template>
  <div
    v-if="hasValuesForLocale"
    :data-field-name="name"
    data-qa="metadata field"
    class="metadata-row d-lg-flex"
  >
    <label
      v-if="labelled"
      data-qa="label"
      class="m-0"
    >
      {{ $t(`fieldLabels.${context}.${name}`) }}
    </label>
    <ul
      class="m-0 p-0 text-left text-lg-right list-unstyled"
    >
      <template
        v-for="(value, index) of displayValues.values"
      >
        <template
          v-if="value.about"
        >
          <li
            v-for="(nestedValue, nestedIndex) of value.values"
            :key="index + '_' + nestedIndex"
            :lang="value.code"
            data-qa="entity value"
          >
            <EntityField
              :value="nestedValue"
              :about="value.about"
            />
          </li>
        </template>
        <li
          v-else
          :key="index"
          :lang="langMappedValues.code"
          data-qa="literal value"
        >
          {{ value }}
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
  import { langMapValueForLocale } from  '../../plugins/europeana/utils';
  import EntityField from './EntityField';

  export default {
    name: 'MetadataField',

    components: {
      EntityField
    },

    props: {
      name: {
        type: String,
        default: ''
      },
      fieldData: {
        type: [String, Object, Array],
        default: null
      },
      context: {
        type: String,
        default: 'default'
      },
      labelled: {
        type: Boolean,
        default: true
      },
      limit: {
        type: Number,
        default: -1
      },
      omitAllUris: {
        type: Boolean,
        default: false
      },
      omitUrisIfOtherValues: {
        type: Boolean,
        default: false
      }
    },

    computed: {
      displayValues() {
        const display = Object.assign({}, this.langMappedValues);

        if (this.limitDisplayValues && (display.values.length > this.limit)) {
          display.values = display.values.slice(0, this.limit).concat(this.$t('formatting.ellipsis'));
        }
        return display;
      },

      limitDisplayValues() {
        return (this.limit > -1);
      },

      langMappedValues() {
        if (this.fieldData === null) {
          return null;
        } else if (typeof (this.fieldData) === 'string') {
          return { values: [this.fieldData], code: '' };
        } else if (Array.isArray(this.fieldData)) {
          return { values: this.fieldData, code: '' };
        }
        return langMapValueForLocale(this.fieldData, this.$i18n.locale, { omitUrisIfOtherValues: this.omitUrisIfOtherValues, omitAllUris: this.omitAllUris });
      },

      hasValuesForLocale() {
        if (this.langMappedValues === null) {
          return null;
        }
        return this.langMappedValues.values.length >= 1;
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import './assets/scss/variables.scss';

  .metadata-row {
    border-bottom: 1px solid #e7e7e9;
    font-size: $font-size-small;
    padding: 1rem 0;

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      border: 0;
      padding-bottom: 0;
    }

    ul {
      font-weight: 600;

      li {
        display: inline;
        &:not(:last-child):after {
          content: ';';
          padding: 0 0.2rem;
        }
      }
    }

    @media (min-width: $bp-large) {
      label,
      ul {
        flex: 1;
      }
    }
  }
</style>
