<template>
  <div
    ref="banner"
    :class="{ 'is-open' : isOpen }"
    :style="bottomPosition"
    class="cookie-disclaimer py-4"
    data-qa="cookie disclaimer"
  >
    <b-container>
      <b-row>
        <b-col class="col-12">
          <div class="cookie-disclaimer-inner">
            <p class="mb-0">
              {{ $t('cookieDisclaimer.terms') }}
              <SmartLink
                class="more-info"
                destination="/rights"
              >
                {{ $t('cookieDisclaimer.link') }}
              </SmartLink>
            </p>
            <button
              class="accept-btn icon-close btn-transparent"
              :aria-label="$t('cookieDisclaimer.acceptCookieDisclaimer')"
              data-qa="cookie disclaimer button"
              @click="accept"
            />
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import SmartLink from '../generic/SmartLink';

  export default {
    name: 'CookieDisclaimer',

    components: {
      SmartLink
    },

    data() {
      return {
        isOpen: false,
        COOKIE_CONSENT: 'cookieConsent',
        bannerHeight: 0
      };
    },

    computed: {
      bottomPosition() {
        return this.isOpen ? '' : `bottom: -${this.bannerHeight}px`;
      }
    },

    mounted() {
      const status = this.getCookieStatus();

      if (status !== 'accepted') {
        this.isOpen = true;
      }

      this.setBannerHeight();
      window.addEventListener('resize', this.setBannerHeight);
    },

    methods: {
      setBannerHeight() {
        this.bannerHeight = this.$refs.banner.getBoundingClientRect().height;
      },

      accept() {
        this.setCookieStatus();
        this.isOpen = false;
      },

      setCookieStatus() {
        localStorage.setItem(this.COOKIE_CONSENT, 'accepted');
      },

      getCookieStatus() {
        return localStorage.getItem(this.COOKIE_CONSENT);
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '../../assets/scss/variables.scss';

  .cookie-disclaimer {
    transition: all 0.4s ease;
    position: fixed;
    background-color: $innovationblue;
    width: 100%;
    color: $white;
    z-index: 1000;
    font-size: $font-size-small;
    opacity: 0;

    &.is-open {
      opacity: 1;
      bottom: 0px;
    }
  }

  .cookie-disclaimer-inner {
    display: flex;

    .accept-btn {
      transition: all 0.4s ease;
      font-size: 1.5rem;
      padding: 0 1rem;
      align-items: center;
      justify-content: center;
      display: flex;
      cursor: pointer;
      color: $white;

      &:focus {
        outline-color: $white;
      }

      &:hover {
        opacity: 0.8;
      }
    }

    .more-info {
      color: $white;
      &:focus {
        outline-color: $white;
      }
    }
  }
</style>
