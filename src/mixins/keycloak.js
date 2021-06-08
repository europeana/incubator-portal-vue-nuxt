export default {
  computed: {
    keycloakLoginRedirect() {
      let redirect;
      if (this.$route) {
        if (this.$route.query && this.$route.query.redirect) {
          redirect = this.$route.query.redirect;
        } else if (this.$route.fullPath) {
          redirect = this.$route.fullPath;
        }
      }
      return redirect;
    },

    keycloakAccountUrl() {
      if (!this.$auth || !this.$auth.strategy) {
        return null;
      }
      const keycloakAccountUrl = new URL(
        `/auth/realms/${this.$auth.strategy.options.realm}/account`, this.$auth.strategy.options.origin
      );
      keycloakAccountUrl.search = new URLSearchParams({
        referrer: this.$auth.strategy.options.client_id,
        'referrer_uri': this.$config.app.baseUrl
      }).toString();
      return keycloakAccountUrl.toString();
    }
  },

  methods: {
    keycloakLogin() {
      if (!this.$auth || !this.$auth.$storage) {
        return;
      }
      this.$auth.$storage.setUniversal('redirect', this.keycloakLoginRedirect);
      this.$auth.$storage.setUniversal('portalLoggingIn', true);
      this.$auth.loginWith('keycloak', { params: { 'ui_locales': this.$i18n.locale } });
    }
  }
};
