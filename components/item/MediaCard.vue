<template>
  <MediaCardImage
    v-if="displayImage"
    :europeana-identifier="europeanaIdentifier"
    :media="media"
    @loaded="() => $emit('loaded')"
  />
  <div
    v-else-if="isSinglePlayableMedia"
    ref="player"
    class="media-player-wrapper col-lg-10 col-12"
  >
    <iframe
      data-qa="media player"
      allowfullscreen="true"
      :src="$path({ name: 'media', query: { id: europeanaIdentifier, mediaUrl: media.about, mediaType: media.ebucoreHasMimeType } })"
      class="media-player"
    />
  </div>
  <VideoPlayer
    v-else-if="isHTMLVideo"
    :europeana-identifier="europeanaIdentifier"
    :src="media.about"
    :type="media.ebucoreHasMimeType"
    :width="media.ebucoreWidth"
    :height="media.ebucoreHeight"
  />
  <div
    v-else-if="isHTMLAudio"
    class="audio-slide"
  >
    <AudioPlayer
      :europeana-identifier="europeanaIdentifier"
      :src="media.about"
      :type="media.ebucoreHasMimeType"
    />
  </div>
  <HTMLEmbed
    v-else-if="isOEmbed"
    :html="oEmbedData.html"
    :error="oEmbedData.error"
  />
  <iframe
    v-else-if="isIIIFImage || isIIIFPresentation"
    data-qa="IIIF viewer"
    allowfullscreen="true"
    class="iiif-iframe"
    :src="$path({ name: 'iiif', query: { uri: iiifManifest } })"
    :aria-label="$t('actions.viewDocument')"
  />
</template>

<script>
  import {
    iiifManifest,
    isHTMLAudio,
    isHTMLVideo,
    isIIIFImage,
    isIIIFPresentation, isOEmbed,
    isPlayableMedia,
    isRichMedia
  } from '../../plugins/media';
  import HTMLEmbed from '../generic/HTMLEmbed';
  import VideoPlayer from '../../components/media/VideoPlayer';
  import AudioPlayer from '../../components/media/AudioPlayer';
  import oEmbed from '../../plugins/oembed';

  export default {
    name: 'MediaCard',
    components: {
      MediaCardImage: () => import('../../components/item/MediaCardImage'),
      HTMLEmbed,
      VideoPlayer,
      AudioPlayer
    },
    props: {
      media: {
        type: Object,
        default: null
      },
      europeanaIdentifier: {
        type: String,
        default: ''
      },
      isSinglePlayableMedia: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        oEmbedData: {}
      };
    },

    computed: {
      displayImage() {
        return !isRichMedia(this.media);
      },
      isPlayableMedia() {
        return isPlayableMedia(this.media);
      },
      isHTMLVideo() {
        return isHTMLVideo(this.media);
      },
      isHTMLAudio() {
        return isHTMLAudio(this.media);
      },
      isIIIFImage() {
        return isIIIFImage(this.media);
      },
      isIIIFPresentation() {
        return isIIIFPresentation(this.media);
      },
      iiifManifest() {
        return iiifManifest(this.media, this.europeanaIdentifier);
      },
      isOEmbed() {
        return isOEmbed(this.media);
      }
    },

    created() {
      if (this.isOEmbed) {
        oEmbed(this.media.about).then((response) => {
          if (response.data && response.data.html) {
            this.oEmbedData = response.data;
          } else {
            this.oEmbedData = { error: this.$t('messages.externalContentError') };
          }
        }).catch((err) => {
          this.oEmbedData = { error: err };
        });
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import './assets/scss/variables.scss';

  // TODO: move the code below to video component when we switch to new item page
  /deep/ video {
    height: 80vh;
    max-height: 25rem;
    max-width: 100%;
    width: auto;

    @media (min-width: $bp-medium) {
      max-height: 35.5rem;
    }
  }
</style>
