export default `
  query LatestCardGroups($preview: Boolean = false, $locale: String!, $limit: Int = 4, $exhibitions: Boolean = false, $galleries: Boolean = false, $blogPosts: Boolean = false) {
    exhibitionPageCollection(preview: $preview, locale: $locale, order: datePublished_DESC, limit: $limit) @include(if: $exhibitions) {
      total
      items {
        identifier
        name
        description
        primaryImageOfPage {
          ...imageComparisonFields
        }
      }
    }
    imageGalleryCollection(preview: $preview, locale: $locale, order: datePublished_DESC, limit: $limit) @include(if: $galleries) {
      total
      items {
        identifier
        name
        description
        hasPartCollection(limit: 1) {
          items {
            encoding
          }
        }
      }
    }
    blogPostingCollection(preview: $preview, locale: $locale, order: datePublished_DESC, limit: $limit) @include(if: $blogPosts) {
      total
      items {
        identifier
        name
        description
        primaryImageOfPage {
          ...imageComparisonFields
        }
      }
    }
  }

  fragment imageComparisonFields on ImageWithAttribution {
    image {
      url
      description
      contentType
    }
  }
`;
