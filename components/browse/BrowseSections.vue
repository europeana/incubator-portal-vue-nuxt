<template>
  <div class="figure-attribution">
    <template
      v-for="(section, index) in content"
    >
      <RichText
        v-if="contentType(section, 'ContentTypeRichText')"
        :key="index"
        :text="section.text"
        :rich-text-is-card="richTextIsCard"
      />
      <ContentCardSection
        v-else-if="contentType(section, 'CardGroup')"
        :key="index"
        :section="section"
      />
      <LatestSection
        v-else-if="contentType(section, 'LatestCardGroup') && section.total"
        :key="index"
        :category="section.genre"
        :total="section.total"
        :cards="section.items"
      />
      <HTMLEmbed
        v-else-if="contentType(section, 'Embed')"
        :key="index"
        :html="section.embed"
      />
      <CompareImageSlider
        v-else-if="contentType(section, 'ImageComparison')"
        :key="index"
        :left-image-src="section.hasPartCollection.items[0].image.url"
        :left-image-content-type="section.hasPartCollection.items[0].image.contentType"
        :left-image-attribution="attributionFields(section.hasPartCollection.items[0])"
        :left-image-width="section.hasPartCollection.items[0].image.width"
        :left-image-height="section.hasPartCollection.items[0].image.height"
        :right-image-src="section.hasPartCollection.items[1].image.url"
        :right-image-content-type="section.hasPartCollection.items[1].image.contentType"
        :right-image-attribution="attributionFields(section.hasPartCollection.items[1])"
        :right-image-width="section.hasPartCollection.items[1].image.width"
        :right-image-height="section.hasPartCollection.items[1].image.height"
      />
      <ImageWithAttribution
        v-else-if="contentType(section, 'ImageWithAttribution')"
        :key="index"
        :src="section.image.url"
        :content-type="section.image.contentType"
        :width="section.image.width"
        :height="section.image.height"
        :attribution="attributionFields(section)"
        :rights-statement="section.license"
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

    async fetch() {
      this.content = await this.sectionsWithLatestCardGroups(this.sections);
    },

    data() {
      return {
        content: this.sections
      };
    },

    methods: {
      async sectionsWithLatestCardGroups(sections) {
        const content = [].concat(sections);
        const genres = content
          .filter(item => item && (item['__typename'] === 'LatestCardGroup'))
          .map(item => item.genre);

        if (genres.length === 0) return content;

        const variables = {
          locale: this.$i18n.isoLocale(),
          preview: this.$route.query.mode === 'preview',
          exhibitions: genres.includes('Exhibitions'),
          blogPosts: genres.includes('Blog posts'),
          galleries: genres.includes('Galleries'),
          limit: 4
        };

        let responseData;
        try {
          const response = await this.$contentful.query('latestCardGroups', variables);
          responseData = response.data;
        } catch (e) {
          return content;
        }

        // merge the latest card group data into the main content
        for (let i = 0; i < content.length; i++) {
          if (content[i] && content[i]['__typename'] === 'LatestCardGroup') {
            let latest = {};
            switch (content[i].genre) {
            case 'Exhibitions':
              latest = responseData.data.exhibitionPageCollection;
              break;
            case 'Blog posts':
              latest = responseData.data.blogPostingCollection;
              break;
            case 'Galleries':
              latest = responseData.data.imageGalleryCollection;
              break;
            }
            content[i] = { ...content[i], ...latest };
          }
        }

        return content;
      },
      contentType(section, typeName) {
        return section && (section['__typename'] === typeName);
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
