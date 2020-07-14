<template>
  <b-container
    fluid
    class="image-wrapper"
  >
    <b-jumbotron
      fluid
      text-variant="white"
      class="mt-2"
      :class="hero ? 'hero' : ''"
      @click="toggleCite"
    >
      <figure>
        <OptimisedImage
          :src="src"
          :width="width"
          :height="height"
          :content-type="contentType"
          :max-width="1100"
          data-qa="image"
        />
        <figcaption
          @mouseleave="toggleCite"
        >
          <span
            v-if="citeCollapsed"
            class="icon-info"
            @click="toggleCite"
            @mouseover="toggleCite"
            @touchstart="toggleCite"
          />
          <CiteAttribution
            v-else
            :name="attribution.name"
            :creator="attribution.creator"
            :provider="attribution.provider"
            :rights-statement="rightsStatement"
            :url="attribution.url"
            extended
            data-qa="attribution"
          />
        </figcaption>
      </figure>
    </b-jumbotron>
  </b-container>
</template>

<script>
  import CiteAttribution from './CiteAttribution';
  import OptimisedImage from './OptimisedImage';

  export default {
    name: 'ImageWithAttribution',

    components: {
      CiteAttribution,
      OptimisedImage
    },

    props: {
      header: {
        type: String,
        default: ''
      },
      lead: {
        type: String,
        default: ''
      },
      src: {
        type: String,
        required: true,
        default: ''
      },
      width: {
        type: Number,
        default: 550
      },
      height: {
        type: Number,
        default: 790
      },
      name: {
        type: String,
        default: null
      },
      contentType: {
        type: String,
        default: null
      },
      attribution: {
        type: Object,
        required: true
      },
      rightsStatement: {
        type: String,
        default: ''
      },
      hero: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        citeCollapsed: true
      };
    },
    methods: {
      toggleCite() {
        this.citeCollapsed = !this.citeCollapsed;
      }
    }
  };
</script>
