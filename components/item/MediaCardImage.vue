<template>
  <b-link
    v-if="imageLink && media.thumbnails['large']"
    :href="imageLink"
    target="_blank"
  >
    <b-img-lazy
      :src="media.thumbnails['large']"
      ref="lazyImg"
      class="w-auto"
      alt=""
      data-qa="media preview image"
    />
    <span
      class="sr-only"
    >
      ({{ $t('newWindow') }})
    </span>
  </b-link>
  <b-img-lazy
    v-else-if="!imageLink && media.thumbnails['large']"
    :src="media.thumbnails['large']"
    ref="lazyImg"
    alt=""
    class="mw-100"
    data-qa="media preview image"
  />
</template>

<script>
  export default {
    name: 'MediaCardImage',
    props: {
      media: {
        type: Object,
        default: null
      },
      europeanaIdentifier: {
        type: String,
        default: ''
      }
    },
    mounted() {
      this.$watch(
        () => {
          return this.$refs.lazyImg.isShown;
        },
        (imageIsShown) => {
          if (imageIsShown) this.$emit('loaded');
        }
      );
    },
    computed: {
      imageLink() {
        return this.$store.getters['apis/record'].mediaProxyUrl(this.media.about, this.europeanaIdentifier, { disposition: 'inline' });
      }
    }
  };
</script>

<style lang="scss" scoped>
@import './assets/scss/variables.scss';

img {
  height: 100%;
  @media (max-width: $bp-medium) {
    max-height: 100%;
    height: auto;
  }
}
</style>
