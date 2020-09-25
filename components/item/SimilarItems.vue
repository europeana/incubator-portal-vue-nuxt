<template>
  <section
    v-if="similarItems && similarItems.length > 0"
  >
    <h2>{{ $t('record.similarItems') }}</h2>
    <ItemPreviewCardGroup
      v-model="similarItems"
      view="similar"
      class="mb-3"
    />
  </section>
</template>

<script>
  export default {
    components: {
      ItemPreviewCardGroup: () => import('../../components/item/ItemPreviewCardGroup'),
    },

    props: {
      europeanaIdentifier: {
        type: String,
        required: true
      },

      fields: {
        type: Object,
        required: true
      }
    },

    fetch() {

    }
  };
</script>
