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
      <b-img-lazy
        v-if="variant === 'entity' && cardImageUrl && lazyLoad"
        :src="optimisedImageUrl"
        :blank-width="blankImageWidth"
        :blank-height="blankImageHeight"
        alt=""
        @error.native="imageNotFound"
      />
      <b-img
        v-if="variant === 'entity' && cardImageUrl && !lazyLoad"
        :src="optimisedImageUrl"
        alt=""
      />
      <div
        v-if="cardImageUrl"
        class="card-img"
      >
        <b-img-lazy
          v-if="variant !== 'entity' && lazyLoad"
          :src="optimisedImageUrl"
          :blank-width="blankImageWidth"
          :blank-height="blankImageHeight"
          alt=""
          @error.native="imageNotFound"
        />
        <b-img
          v-if="variant !== 'entity' && !lazyLoad"
          :src="optimisedImageUrl"
          alt=""
        />
      </div>
      <b-card-body>
        <b-card-title
          v-if="displayTitle"
          title-tag="div"
          :lang="displayTitle.lang"
        >
          {{ displayTitle.value | truncate(90, $t('formatting.ellipsis')) }}
        </b-card-title>
        <time
          v-if="datetime"
          class="font-weight-bold pb-3"
          data-qa="date"
          :datetime="datetime"
        >
          {{ $d(new Date(datetime), 'short') }}
        </time>
        <template v-if="displayTexts.length > 0">
          <template
            v-for="(text, index) in displayTexts"
          >
            <b-card-text
              :key="index"
              :lang="text.lang"
              text-tag="div"
            >
              <!-- eslint-disable vue/no-v-html -->
              <p
                v-html="cardText(text.value)"
              />
              <!-- eslint-enable vue/no-v-html -->
            </b-card-text>
          </template>
        </template>
      </b-card-body>
    </SmartLink>
  </b-card>
</template>

<script>
  import SmartLink from './SmartLink';
  import { langMapValueForLocale } from  '../../plugins/europeana/utils';

  export default {
    name: 'ContentCard',

    components: {
      SmartLink
    },

    props: {
      title: {
        // may be a string or a lang map
        type: [String, Object],
        default: ''
      },
      // each element may be a string, an array of strings, or a lang map
      texts: {
        type: Array,
        default: () => []
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
      }
    },

    data() {
      return {
        cardImageUrl: this.imageUrl
      };
    },

    computed: {
      cardClass() {
        return `${this.variant}-card`;
      },

      lazyLoad() {
        return this.lazy && !process.env.NODE_ENV === 'test';
      },

      displayTitle() {
        return langMapValueForLocale(this.title, this.$i18n.locale);
      },

      displayTexts() {
        return this.texts.map((value) => {
          return langMapValueForLocale(value, this.$i18n.locale, { omitUrisIfOtherValues: this.omitUrisIfOtherValues, omitAllUris: this.omitAllUris });
        }).filter(Boolean);
      },

      optimisedImageUrl() {
        return this.$options.filters.optimisedImageUrl(this.imageUrl, this.imageContentType, this.imageOptimisationOptions);
      }
    },

    // mounted() {
    //   console.log('ContentCard displayTitle', this.displayTitle);
    //   console.log('ContentCard displayTexts', this.displayTexts);
    // },

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
