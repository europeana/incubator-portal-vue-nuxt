export default `
query BlogPostPage(
    $identifier: String!,
    $locale: String!,
    $preview: Boolean = false
  ) {
    blogPostingCollection(preview: $preview, locale: $locale, where: { identifier: $identifier }, limit: 1) {
      items {
        identifier
        name
        description
        datePublished
        primaryImageOfPage {
          ... imageWithAttributionFields
        }
        hasPartCollection(limit: 40) {
          total
          items {
            __typename
            ... on ContentTypeRichText {
              text
            }
            ... on Embed {
              embed
            }
            ... on ImageWithAttribution {
              ... imageWithAttributionFields
            }
            ... on ImageComparison {
              name
              hasPartCollection(limit: 2) {
                items {
                  ... imageWithAttributionFields
                }
              }
            }
            ... on Link {
              url
              text
            }
            # CardGroup omitted intentionally
          }
        }
        genre
        keywords
        authorCollection {
          items {
            name
            affiliation
            url
          }
        }
      }
    }
  }

  fragment imageWithAttributionFields on ImageWithAttribution {
    name
    creator
    provider
    license
    url
    image {
      url
      description
      contentType
      width
      height
    }
  }
`;
