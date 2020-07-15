<template>
  <SmartLink
    :destination="rightsStatement"
    class="rights-statement-button attribution mb-3 mb-lg-0"
    data-qa="rights statement"
    hide-external-icon
  >
    <RightsStatement
      :rights-statement-url="rightsStatement"
    />
  </SmartLink>
</template>

<script>
  import RightsStatement from '../../components/generic/RightsStatement';
  import SmartLink from '../../components/generic/SmartLink';

  export default {
    components: {
      RightsStatement,
      SmartLink
    },
    props: {
      rightsStatement: {
        type: String,
        default: ''
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '../../assets/scss/variables.scss';

  .rights-statement-button {
    color: $mediumgrey;
    background: $offwhite;
    border-radius: 0.25rem;
    padding: 0.625rem;
  }
</style>
