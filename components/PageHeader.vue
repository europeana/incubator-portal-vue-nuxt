<template>
  <b-container
    ref="nav-container"
    v-visible-on-scroll
    fluid
    class="border-bottom d-flex py-0 px-lg-3 flex-column flex-lg-row align-items-center show"
    data-qa="header"
  >
    <header
      class="col p-0 m-0 text-center text-lg-left navbar-brand d-flex align-items-center justify-content-between justify-content-lg-start flex-row"
      role="banner"
      aria-label="Europeana home"
    >
      <b-button
        v-show="!showSearch"
        variant="light"
        class="navbar-toggle collapsed ml-3 p-0 flex-column align-items-center justify-content-center"
        :aria-label="$t('header.showSidebar')"
        @click="showSidebar = !showSidebar"
      >
        <span />
        <span />
        <span />
      </b-button>
      <SmartLink
        v-show="!showSearch"
        :destination="{ name: 'index' }"
        class="logo d-lg-block"
      >
        <img
          src="../assets/img/logo.svg"
          :alt="$t('homeLinkAlt')"
          class="mw-100"
          data-qa="logo"
        >
      </SmartLink>
      <SearchForm
        data-qa="search form"
        role="search"
        class="px-lg-3 mr-lg-auto mx-xl-auto"
        aria-label="search form"
        :enable-auto-suggest="enableAutoSuggest"
      />
    </header>
    <b-navbar
      class="p-lg-0 align-items-start justify-content-lg-end flex-column flex-lg-row d-none d-lg-block"
      role="navigation"
      data-qa="desktop navigation"
    >
      <PageNavigation
        v-if="mainNavigation"
        :links="mainNavigation.links"
      />
    </b-navbar>
    <transition name="slide">
      <b-navbar
        v-if="showSidebar"
        class="p-lg-0 align-items-start justify-content-lg-end flex-column flex-lg-row d-lg-none"
        role="navigation"
        data-qa="mobile navigation"
      >
        <SmartLink
          :destination="{ name: 'index' }"
          class="logo d-block d-lg-none px-2"
        >
          <img
            src="../assets/img/logo.svg"
            :alt="$t('homeLinkAlt')"
            class="mb-lg-2 mw-100"
            data-qa="logo"
          >
        </SmartLink>
        <PageNavigation
          v-if="mobileNavigation"
          :links="mobileNavigation.links"
        />
      </b-navbar>
    </transition>
    <transition name="fade">
      <span
        v-if="showSidebar"
        class="close-menu"
        @click="showSidebar = !showSidebar"
      />
    </transition>
  </b-container>
</template>

<script>
  import SmartLink from './generic/SmartLink';
  import SearchForm from './search/SearchForm';
  import PageNavigation from './PageNavigation';

  export default {
    components: {
      SmartLink,
      SearchForm,
      PageNavigation
    },

    props: {
      enableAutoSuggest: {
        type: Boolean,
        default: false
      },
      mainNavigation: {
        type: Object,
        default: null
      },
      mobileNavigation: {
        type: Object,
        default: null
      }
    },

    data() {
      return {
        showSidebar: null,
        windowWidth: 0
      };
    },

    computed: {
      showSearch: {
        get() {
          return this.$store.getters['ui/searchView'];
        }
      }
    },

    watch: {
      '$route'() {
        if (this.showSidebar) {
          this.showSidebar = false;
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '../assets/scss/variables.scss';

  .container-fluid {
    background: $white;
    position: fixed;
    right: 0;
    top: 0;
    left: 0;
    z-index: 1030;
    padding: 0;
    border-bottom: 1px solid $whitegrey;
  }

  .slide-enter-active, .fade-enter-active {
    transition: 0.3s cubic-bezier(0.24, 1, 0.32, 1);
  }

  .slide-leave-active, .fade-leave-active {
    transition: 0.2s cubic-bezier(0.4, 0.0, 1, 1);
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(-100%, 0, 0);
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

  .navbar-brand {
    min-width: 11.0625rem;
    flex: 0 0 auto;
    .logo {
      min-width: 9.5625rem;
      padding: 0.735rem 0 !important;
      transition: 0.3s ease-in-out;
      img {
        width: 9.5625rem;
      }
    }
  }

  .navbar {
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background: $white;
    z-index: 99;
    width: 16rem;
    padding: 1rem 0.5rem;
    .navbar-nav {
      padding-top: 1rem;
      flex-direction: column;
      width: 100%;
    }
  }

  @media (max-width: $bp-large) {
    .close-menu {
      position: fixed;
      right: 0;
      top: 0;
      height: 100vh;
      width: 100%;
      border-radius: 0;
      outline: none;
      transition: 0.5s;
      background-color: rgba(0, 0, 0, 0.7);
      cursor: pointer;
    }
    .navbar-toggle {
      display: flex;
      align-items: center;
      width: 1.5rem;
      height: 1.5rem;
      box-shadow: none;
      span {
        width: 1.125rem;
        background: $black;
        height: 2px;
        margin-bottom: 3px;
        &:last-of-type { margin-bottom: 0; }
      }
    }
  }

  @media (min-width: $bp-large) {
    .navbar {
      position: relative;
      display: flex;
      height: auto;
      left: initial;
      top: initial;
      width: auto;
      padding: 0;
      .navbar-nav {
        padding-top: 0;
        flex-direction: row;
        width: 100%;
      }
    }
    .navbar-brand {
      flex: 3;
    }
    .navbar-toggle {
      display: none;
    }
    .form-inline {
      width: 100%;
      max-width: 37.5rem;
    }
    @media (max-width: $bp-large) {
      .navbar-brand {
        justify-content: center;
      }
    }
    .container-fluid {
      transition: $standard-transition;
    }
  }
  @media (min-width: $bp-extralarge) {
    .navbar-brand {
      .logo {
        min-width: 18.75rem;
      }
    }
  }
</style>
