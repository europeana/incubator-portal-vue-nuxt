<template>
  <figure
    ref="container"
    class="compare-image-wrapper"
  >
    <div
      class="compare-image"
      data-qa="compare image"
    >
      <OptimisedImage
        ref="leftImage"
        :style="leftImageClip"
        :src="leftImageSrc"
        :width="leftImageWidth"
        :height="leftImageHeight"
        :content-type="leftImageContentType"
        :max-width="1100"
        data-qa="compare image left image"
      />
      <OptimisedImage
        ref="rightImage"
        :src="rightImageSrc"
        :width="rightImageWidth"
        :height="rightImageHeight"
        :content-type="rightImageContentType"
        :max-width="1100"
        data-qa="compare image right image"
      />
      <div
        ref="slider"
        class="slider"
        :style="sliderBarPosition"
        data-qa="compare image slider"
        @mousedown="initDrag"
        @touchstart="initDrag"
      >
        <span class="slider-bar" />
        <button
          :class="{ 'is-active' : dragging }"
          class="slider-handle"
          data-qa="compare image slider handler"
        >
          <span class="sr-only">{{ $t('imageSlider.handle') }}</span>
        </button>
      </div>
    </div>
    <figcaption>
      <CiteAttribution
        :name="leftImageAttribution.name"
        :creator="leftImageAttribution.creator"
        :provider="leftImageAttribution.provider"
        :rights-statement="leftImageAttribution.rightsStatement"
        :url="leftImageAttribution.url"
        :class="hideAttribution === 'left' && 'cite-hidden'"
        data-qa="compare image left attribution"
        :data-prefix="$t('directions.left')"
      />
      <CiteAttribution
        :name="rightImageAttribution.name"
        :creator="rightImageAttribution.creator"
        :provider="rightImageAttribution.provider"
        :rights-statement="rightImageAttribution.rightsStatement"
        :url="rightImageAttribution.url"
        :class="hideAttribution === 'right' && 'cite-hidden'"
        data-qa="compare image right attribution"
        :data-prefix="$t('directions.right')"
      />
    </figcaption>
  </figure>
</template>

<script>
  import CiteAttribution from './CiteAttribution';
  import OptimisedImage from './OptimisedImage';

  export default {
    name: 'CompareImageSlider',

    components: {
      CiteAttribution,
      OptimisedImage
    },

    props: {
      leftImageSrc: {
        type: String,
        required: true
      },

      leftImageContentType: {
        type: String,
        default: null
      },

      leftImageWidth: {
        type: Number,
        required: true
      },

      leftImageHeight: {
        type: Number,
        required: true
      },

      leftImageAttribution: {
        type: Object,
        required: true
      },

      rightImageSrc: {
        type: String,
        required: true
      },

      rightImageContentType: {
        type: String,
        default: null
      },

      rightImageWidth: {
        type: Number,
        required: true
      },

      rightImageHeight: {
        type: Number,
        required: true
      },

      rightImageAttribution: {
        type: Object,
        required: true
      }
    },

    data() {
      return {
        dragging: false,
        imageWidth: 0,
        sliderWidth: 0,
        sliderPosition: 0.5,
        hideAttribution: null
      };
    },

    computed: {
      leftImageClip() {
        const rightLength = this.imageWidth * this.sliderPosition;
        return {
          clip: `rect(auto, ${rightLength}px, auto, auto)`
        };
      },

      sliderBarPosition() {
        const leftPosition = (this.imageWidth * this.sliderPosition) - (this.sliderWidth / 2);
        return {
          left: `${leftPosition}px`
        };
      }
    },

    beforeDestroy() {
      window.removeEventListener('touchmove', this.stopDrag);
      window.removeEventListener('mousemove', this.drag);
    },

    mounted() {
      this.setImageWidth();
      this.setSliderWidth();

      window.addEventListener('resize', this.setImageWidth);
      window.addEventListener('mousemove', this.drag);
      window.addEventListener('mouseup', this.stopDrag);
      window.addEventListener('touchmove', this.drag);
      window.addEventListener('touchend', this.stopDrag);
    },

    methods: {
      setImageWidth() {
        this.imageWidth = this.$refs.rightImage.$el.getBoundingClientRect().width;
      },

      setSliderWidth() {
        this.sliderWidth = this.$refs.slider.getBoundingClientRect().width;
      },

      initDrag() {
        this.dragging = true;
      },

      stopDrag() {
        this.dragging = false;
      },

      showHideAttribution() {
        if (this.sliderPosition < 0.2) {
          this.hideAttribution = 'left';
        } else if (this.sliderPosition > 0.8) {
          this.hideAttribution = 'right';
        } else {
          this.hideAttribution = '';
        }
      },

      drag(event) {
        // Calc Cursor Position from the left edge of the viewport
        const cursorXfromViewport = event.touches ? event.touches[0].pageX : event.pageX;
        // Calc Cursor Position from the left edge of the window (consider any page scrolling)
        const cursorXfromWindow = cursorXfromViewport - window.pageXOffset;
        // Calc Cursor Position from the left edge of the image
        const imagePosition = this.$refs.rightImage.$el.getBoundingClientRect();
        let pos = cursorXfromWindow - imagePosition.left;

        const minPos = 0 + (this.sliderWidth / 2);
        const maxPos = this.imageWidth - (this.sliderWidth / 2);

        if (pos < minPos) {
          pos = minPos;
        }

        if (pos > maxPos) {
          pos = maxPos;
        }

        if (this.dragging) {
          this.sliderPosition = pos / this.imageWidth;
          this.showHideAttribution();
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import './assets/scss/variables.scss';

  $slider-dimensions: 48px;

  figure {
    display: inline-block;
  }

  .compare-image {
    position: relative;
    overflow: hidden;

    img {
      width: auto;

      &:nth-child(1) {
        position: absolute;
        top: 0;
        left: 0;
      }
    }

    .slider {
      width: $slider-dimensions;
      height: 100%;
      position: absolute;
      top: 0;
      align-items: center;
      display: flex;

      .slider-handle {
        position: absolute;
        background: rgba(255, 255, 255, 0.5);
        width: $slider-dimensions;
        height: $slider-dimensions;
        border: 0;
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0);

        &.is-active {
          background: rgba(255, 255, 255, 0.85);
        }

        &:before,
        &:after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          top: 50%;
          border-top: solid 2px;
          border-left: solid 2px;
          transform-origin: 0 0;
        }

        &:before {
          left: 10px;
          transform: rotate(-45deg);
        }

        &:after {
          right: 0;
          transform: rotate(135deg);
        }

        &:hover {
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.4);

          &:before {
            left: 9px;
          }

          &:after {
            right: -1px;
          }
        }
      }
    }

    & + figcaption {

      cite {
        display: block;
        margin: 0;
        position: static;

        &:before {
          content: attr(data-prefix);
          font-style: normal;
        }
      }

      @media (min-width: $bp-large) {
        cite {
          max-width: 45%;
          position: absolute;
          transition: opacity 0.2s ease-out;

          &:before {
            display: none;
          }

          &:nth-child(2) {
            left: auto;
            margin-left: 1rem;
            margin-right: 0;
            right: 1rem;
          }
        }

        .cite-hidden {
          opacity: 0;
        }
      }
    }
  }
</style>
