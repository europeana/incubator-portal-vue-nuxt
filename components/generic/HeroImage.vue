<template>
  <b-jumbotron
    :header="header"
    :lead="lead"
    :style="jumbotronStyle"
    fluid
    class="browse-jumbotron"
    header-tag="h1"
    header-level="4"
    text-variant="white"
    data-qa="hero banner"
  >
    <figcaption>
      <CiteAttribution
        :name="name"
        :creator="creator"
        :provider="provider"
        :rights-statement="rightsStatement"
        :url="url"
      />
    </figcaption>
  </b-jumbotron>
</template>

<script>
  import CiteAttribution from '../../components/generic/CiteAttribution';

  export default {
    components: {
      CiteAttribution
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
      imageUrl: {
        type: String,
        default: ''
      },
      imageContentType: {
        type: String,
        default: null
      },
      name: {
        type: String,
        default: null
      },
      creator: {
        type: String,
        default: null
      },
      provider: {
        type: String,
        default: null
      },
      rightsStatement: {
        type: String,
        default: ''
      },
      url: {
        type: String,
        default: ''
      }
    },
    computed: {
      optimisedImageUrl() {
        return this.$options.filters.optimisedImageUrl(this.imageUrl, this.imageContentType, { width: 1920 });
      },
      jumbotronStyle() {
        return {
          backgroundImage: `url("${this.optimisedImageUrl}")`
        };
      }
    }
  };
</script>
