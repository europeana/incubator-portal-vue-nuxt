<template>
  <b-card
    class="text-left content-card"
    data-qa="content card"
    no-body
    :class="cardClass"
  >
    <SmartLink
      :destination="url"
      link-class="card-link"
    >
      <div
        v-if="cardImageUrl"
        class="card-img"
      >
        <b-img-lazy
          v-if="lazy"
          :src="optimisedImageUrl"
          :blank-width="blankImageWidth"
          :blank-height="blankImageHeight"
          alt=""
          @error.native="imageNotFound"
        />
        <b-img
          v-else
          :src="optimisedImageUrl"
          alt=""
          @error="imageNotFound"
        />
      </div>
      <b-card-body data-qa="card body">
        <b-card-sub-title
          v-if="displaySubTitle && variant !== 'mini'"
          sub-title-tag="div"
          sub-title-text-variant="default"
          class="mt-0"
        >
          {{ displaySubTitle }}
        </b-card-sub-title>
        <b-card-title
          v-if="displayTitle"
          title-tag="div"
          data-qa="card title"
          :lang="displayTitle.code"
        >
          {{ displayTitle.values[0] | truncate(90, $t('formatting.ellipsis')) }}
        </b-card-title>
        <time
          v-if="datetime"
          class="font-weight-bold pb-3"
          data-qa="date"
          :datetime="datetime"
        >
          {{ $d(new Date(datetime), 'short') }}
        </time>
        <template v-if="hitsText">
          <b-card-text
            text-tag="div"
            data-qa="highlighted search term"
          >
            <p>{{ hitsText.prefix }}<strong class="has-text-highlight">{{ hitsText.exact }}</strong>{{ hitsText.suffix }}</p>
          </b-card-text>
        </template>
        <template v-if="displayTexts.length > 0">
          <template
            v-for="(text, index) in displayTexts"
          >
            <b-card-text
              :key="index"
              :lang="text.code"
              text-tag="div"
            >
              <!-- eslint-disable vue/no-v-html -->
              <p
                v-html="cardText(text.values)"
              />
              <!-- eslint-enable vue/no-v-html -->
            </b-card-text>
          </template>
        </template>
      </b-card-body>
    </SmartLink>
    <UserButtons
      v-if="showUserButtons"
      :item-url="url"
    />
  </b-card>
</template>

<script>
  import SmartLink from './SmartLink';
  import UserButtons from '../account/UserButtons';

  export default {
    name: 'ContentCard',

    components: {
      SmartLink,
      UserButtons
    },

    props: {
      title: {
        // may be a string or a lang map
        type: [String, Object],
        default: ''
      },
      subTitle: {
        type: String,
        default: null
      },
      // each element may be a string, an array of strings, or a lang map
      texts: {
        type: Array,
        default: () => []
      },
      hitsText: {
        type: Object,
        default: null
      },
      url: {
        type: [String, Object],
        default: ''
      },
      imageUrl: {
        type: String,
        default: ''
      },
      imageContentType: {
        type: String,
        default: null
      },
      imageOptimisationOptions: {
        type: Object,
        default: () => {}
      },
      lazy: {
        type: Boolean,
        default: true
      },
      datetime: {
        type: String,
        default: ''
      },
      variant: {
        type: String,
        default: 'default' // other options: entity, mini, list
      },
      omitAllUris: {
        type: Boolean,
        default: false
      },
      omitUrisIfOtherValues: {
        type: Boolean,
        default: false
      },
      limitValuesWithinEachText: {
        type: Number,
        default: -1
      },
      blankImageHeight: {
        type: Number,
        default: null
      },
      blankImageWidth: {
        type: Number,
        default: null
      },
      showUserButtons: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        cardImageUrl: this.imageUrl,
        displayLabelTypes: 'exhibitions|galleries|blog'
      };
    },

    computed: {
      cardClass() {
        return `${this.variant}-card`;
      },

      displayTitle() {
        if (!this.title) {
          return null;
        } else if (typeof this.title === 'string') {
          return { values: [this.title], code: null };
        } else {
          return this.$apis.utils.langMapValueForLocale(this.title, this.$i18n.locale);
        }
      },

      displaySubTitle() {
        return this.subTitle || this.displayLabel;
      },

      displayLabel() {
        if (!this.displayLabelType) return false;
        return this.$tc(`${this.displayLabelType}.${this.displayLabelType}`, 1);
      },

      displayLabelType() {
        return this.displayLabelMatch ? this.displayLabelMatch[1] : false;
      },

      displayLabelMatch() {
        return typeof this.url === 'object' ? this.displayLabelMatchObject : this.displayLabelMatchString;
      },

      displayLabelMatchObject() {
        return this.url.name.match(new RegExp(`(${this.displayLabelTypes})`));
      },

      displayLabelMatchString() {
        return this.url.match(new RegExp(`/(${this.displayLabelTypes})[/.]`));
      },

      displayTexts() {
        return this.texts.filter(Boolean).map((value) => {
          if (typeof value === 'string') {
            return { values: [value], code: null };
          } else if (Array.isArray(value)) {
            return { values: value, code: null };
          } else {
            return this.$apis.utils.langMapValueForLocale(value, this.$i18n.locale, { omitUrisIfOtherValues: this.omitUrisIfOtherValues, omitAllUris: this.omitAllUris });
          }
        });
      },

      optimisedImageUrl() {
        return this.$options.filters.optimisedImageUrl(this.imageUrl, this.imageContentType, this.imageOptimisationOptions);
      }
    },

    methods: {
      cardText(values) {
        const limited = (this.limitValuesWithinEachText > -1) ? values.slice(0, this.limitValuesWithinEachText) : [].concat(values);
        if (values.length > limited.length) limited.push(this.$t('formatting.ellipsis'));
        const joined = limited.join(this.$t('formatting.listSeperator') + ' ');
        const stripped = this.$options.filters.stripMarkdown(joined);
        return this.$options.filters.truncate(stripped, 255, this.$t('formatting.ellipsis'));
      },

      imageNotFound() {
        this.cardImageUrl = '';
      }
    }
  };
</script>
