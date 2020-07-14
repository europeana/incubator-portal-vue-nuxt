<template>
  <section data-qa="action bar">
    <b-row v-show="!showShareButtons">
      <b-col
        cols="12"
        class="d-flex align-items-start align-items-lg-center flex-column flex-lg-row"
      >
        <div
          role="group"
          class="social-buttons mb-3 mb-lg-0 text-nowrap"
        >
          <b-button
            variant="outline-primary text-decoration-none"
            data-qa="share button"
            size="lg"
            class="mr-lg-1"
            @click="toggleShare"
          >
            {{ $t('actions.share') }}
          </b-button>
          <b-button
            v-if="url"
            :title="downloadDisabled ? $t('record.downloadCopyrightInfo') : false"
            :href="downloadUrl"
            :disabled="downloadDisabled"
            variant="outline-primary text-decoration-none"
            data-qa="download button"
            size="lg"
            class="mr-lg-3"
            :target="!useProxy ? '_blank' : '_self'"
          >
            {{ $t('actions.download') }}
          </b-button>
        </div>

        <SmartLink
          v-if="rightsStatementIsUrl"
          :destination="rightsStatement"
          class="attribution mb-3 mb-lg-0"
          data-qa="rights statement"
        >
          <RightsStatement
            :rights-statement-url="rightsStatement"
          />
        </SmartLink>
        <span
          v-else
          data-qa="rights statement"
        >
          {{ rightsStatement }}
        </span>
        <i18n
          v-if="isShownAt"
          path="actions.viewAt"
          tag="p"
          data-qa="provider name"
          class="mb-0 text-lg-right is-size-4 ml-lg-auto"
        >
          <template v-slot:link>
            <!-- eslint-disable vue/multiline-html-element-content-newline -->
            <SmartLink
              :destination="isShownAt"
              :lang="dataProviderLang"
              link-class="view-at"
            >{{ dataProviderName }}</SmartLink>
            <!-- eslint-enable vue/multiline-html-element-content-newline -->
          </template>
        </i18n>
        <i18n
          v-else
          class="mb-0 text-lg-right is-size-4 ml-lg-auto"
          data-qa="provider name"
          path="actions.providedBy"
          tag="p"
        >
          <template v-slot:provider>
            <span :lang="dataProviderLang">
              {{ dataProviderName }}
            </span>
          </template>
        </i18n>
      </b-col>
    </b-row>
    <b-row
      v-show="showShareButtons"
      data-qa="share buttons bar"
    >
      <b-col
        class="d-flex align-items-center justify-content-between"
      >
        <SocialShare
          :media-url="url"
        />
        <button
          class="icon-close btn-transparent"
          aria-label="hide share buttons"
          @click="toggleShare"
        />
      </b-col>
    </b-row>
  </section>
</template>

<script>
  import RightsStatement from '../../components/generic/RightsStatement';
  import SmartLink from '../../components/generic/SmartLink';
  import SocialShare from '../../components/generic/SocialShare';

  export default {
    name: 'MediaActionBar',

    components: {
      RightsStatement,
      SmartLink,
      SocialShare
    },

    props: {
      url: {
        type: String,
        default: null
      },
      europeanaIdentifier: {
        type: String,
        required: true
      },
      useProxy: {
        type: Boolean,
        required: true
      },
      rightsStatement: {
        type: String,
        default: null
      },
      dataProviderName: {
        type: String,
        default: null
      },
      dataProviderLang: {
        type: String,
        default: null
      },
      isShownAt: {
        type: String,
        default: null
      }
    },

    data() {
      return {
        showShareButtons: false
      };
    },

    computed: {
      rightsStatementIsUrl() {
        return RegExp('^https?://*').test(this.rightsStatement);
      },

      downloadUrl() {
        if (this.downloadDisabled) return null;
        return this.useProxy ? this.$proxyMedia(this.url, this.europeanaIdentifier) : this.url;
      },

      downloadDisabled() {
        return this.rightsStatement && this.rightsStatement.includes('/InC/');
      }
    },

    methods: {
      toggleShare() {
        this.showShareButtons = !this.showShareButtons;
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '../../assets/scss/variables.scss';
  @import '../../assets/scss/icons.scss';

  .social-buttons {
    width: 100%;
    .btn {
      width: 49%;
    }
  }

  @media (min-width: $bp-large) {
    .social-buttons,
    .social-buttons .btn {
      width: auto;
    }
  }

  .attribution {
    margin-right: 0.5rem;
  }

  .view-at.is-external-link {
    &:after {
      content: '\e900';
      @extend .icon-font;
      margin-left: 0.25rem;
      display: inline-block;
    }
  }
</style>
