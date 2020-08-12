<template>
  <span>
    <SmartLink
      v-if="isEuropeanaEntity"
      :destination="{ name: 'collections-type-all', params: { type: destination.type, pathMatch: destination.id } }"
    >
      {{ value }}
    </SmartLink>
    <template
      v-else
    >
      {{ value }}
    </template>
  </span>
</template>

<script>
  import SmartLink from '../generic/SmartLink';

  export default {
    components: {
      SmartLink
    },
    props: {
      value: {
        type: String,
        default: null
      },
      about: {
        type: String,
        required: true
      }
    },
    computed: {
      isEuropeanaEntity() {
        return this.about ? this.$apis.entity.isEntityUri(this.about, ['concept', 'agent']) : false;
      },
      destination() {
        return this.isEuropeanaEntity ? this.$apis.entity.entityParamsFromUri(this.about) : this.about;
      }
    }
  };
</script>

<style lang="scss" scoped>
  a {
    display: inline-block;
    padding-left: 0.2rem;
  }
</style>
