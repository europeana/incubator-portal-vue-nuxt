<template>
  <!-- TODO: delete this test page when linking to Keycloak -->
  <div>
    <b-row class="bg-white">
      <b-col class="m-4 p-4">
        <h1 class="text-center">
          {{ $t('account.title') }}
        </h1>
      </b-col>
    </b-row>
    <b-container>
      <b-row class="m-4">
        <div>
          <p>
            <strong>Username:</strong>
            {{ loggedInUser.preferred_username }}
          </p>
          <p>
            <strong>Email:</strong>
            {{ loggedInUser.email }}
          </p>
        </div>
        <b-row />
      </b-row>
    </b-container>
  </div>
</template>

<script>
  export default {
    middleware: 'auth',

    computed: {
      loggedInUser() {
        return this.$store.state.auth.user;
      }
    },

    head() {
      return {
        title: this.$t('account.title')
      };
    }
  };
</script>
