<template>
  <div
    v-if="hasValuesForLocale"
    :data-field-name="name"
    data-qa="metadata field"
  >
    <label
      v-if="labelled"
      data-qa="label"
    >
      {{ $t(`fieldLabels.${context}.${name}`) }}
    </label>
    <!-- <br>
    <code>fieldData <pre>{{ fieldData }}</pre></code>
    <code>langMappedValues <pre>{{ langMappedValues }}</pre></code> -->
    <ul>
      <template
        v-for="(item, index) of displayValues"
      >
        <!-- FIXME: restore functionality -->
        <template
          v-if="item.about"
        >
          <li
            v-for="(nestedItem, nestedIndex) of item.value"
            :key="index + '.' + nestedIndex"
            :lang="item.lang"
            data-qa="entity value"
          >
            <EntityField
              :value="nestedItem"
              :about="item.about"
            />
          </li>
        </template>
        <li
          v-else
          :key="index"
          :lang="item.lang"
          data-qa="literal value"
        >
          {{ item.value }}
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
        // console.log('MetadataField this.langMappedValues', this.langMappedValues);
        let display = Object.assign({}, this.langMappedValues);

        if (this.limitDisplayValues && (display.length > this.limit)) {
          display = display.slice(0, this.limit).concat(this.$t('formatting.ellipsis'));
        }

        return display;
      },

      limitDisplayValues() {
        return (this.limit > -1);
      },

      langMappedValues() {
        return langMapValueForLocale(this.fieldData, this.$i18n.locale, {
          omitUrisIfOtherValues: this.omitUrisIfOtherValues,
          omitAllUris: this.omitAllUris
        });
      },

      hasValuesForLocale() {
        // console.log('MetadataField this.langMappedValues', this.langMappedValues);
        return this.langMappedValues !== null;
      }
    }
  };
</script>

<style lang="scss" scoped>
  label {
    font-weight: bold;
  }
  ul {
    list-style: none;
    padding: 0;
    li {
      display: inline;
      &:not(:last-child):after {
        content: ';';
        padding: 0 0.2rem;
      }
    }
  }
</style>
