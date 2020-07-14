<template>
  <div />
</template>

<script>
  export default {
    auth: false,
    layout: 'minimal',
    mounted() {
      this.$auth.loginWith('keycloak');
    }
  };
</script>

