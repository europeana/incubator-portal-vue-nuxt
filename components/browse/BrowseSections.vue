<template>
  <div>
    <template
      v-for="section in sections"
    >
      <RichText
        v-if="contentType(section, 'richText')"
        :key="section.sys.id"
        :text="section.fields.text"
        :rich-text-is-card="richTextIsCard"
      />
      <ContentCardSection
        v-else-if="contentType(section, 'cardGroup')"
        :key="section.sys.id"
        :section="section"
      />
      <LatestSection
        v-else-if="contentType(section, 'latestCardGroup')"
        :key="section.sys.id"
        :category="section.fields.genre"
      />
      <HTMLEmbed
        v-else-if="contentType(section, 'embed')"
        :key="section.sys.id"
        :html="section.fields.embed"
      />
      <CompareImageSlider
        v-else-if="contentType(section, 'imageComparison')"
        :key="section.sys.id"
        :left-image-src="section.fields.hasPart[0].fields.image.fields.file.url"
        :left-image-content-type="section.fields.hasPart[0].fields.image.fields.file.contentType"
        :left-image-attribution="attributionFields(section.fields.hasPart[0].fields)"
        :left-image-width="section.fields.hasPart[0].fields.image.fields.file.details.image.width"
        :left-image-height="section.fields.hasPart[0].fields.image.fields.file.details.image.height"
        :right-image-src="section.fields.hasPart[1].fields.image.fields.file.url"
        :right-image-content-type="section.fields.hasPart[1].fields.image.fields.file.contentType"
        :right-image-attribution="attributionFields(section.fields.hasPart[1].fields)"
        :right-image-width="section.fields.hasPart[1].fields.image.fields.file.details.image.width"
        :right-image-height="section.fields.hasPart[1].fields.image.fields.file.details.image.height"
      />
      <ImageWithAttribution
        v-else-if="contentType(section, 'imageWithAttribution')"
        :key="section.sys.id"
        :src="section.fields.image.fields.file.url"
        :content-type="section.fields.image.fields.file.contentType"
        :width="section.fields.image.fields.file.details.image.width"
        :height="section.fields.image.fields.file.details.image.height"
        :attribution="attributionFields(section.fields)"
      />
    </template>
  </div>
</template>

<script>
  export default {
    components: {
      CompareImageSlider: () => import('../generic/CompareImageSlider'),
      ContentCardSection: () => import('./ContentCardSection'),
      LatestSection: () => import('./LatestSection'),
      HTMLEmbed: () => import('../generic/HTMLEmbed'),
      ImageWithAttribution: () => import('../generic/ImageWithAttribution'),
      RichText: () => import('./RichText')
    },

    props: {
      richTextIsCard: {
        type: Boolean,
        default: true
      },
      sections: {
        type: Array,
        default: () => []
      }
    },

    methods: {
      contentType(section, id) {
        if (!section.sys.contentType) {
          return;
        }
        return section.sys.contentType.sys.id === id;
      },
      attributionFields(fields) {
        return {
          name: fields.name,
          creator: fields.creator,
          provider: fields.provider,
          rightsStatement: fields.license,
          url: fields.url
        };
      }
    }
  };
</script>

<style lang="scss" scoped>
  /deep/ .attribution {
    &:after {
      padding-top: 0.2rem;
    }
  }
</style>
