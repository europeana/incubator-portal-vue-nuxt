export default `
  # This is inefficient as it collects the full data for all chapters when that
  # is only needed for the chapter being viewed, but is necessary to validate
  # that the requested exhibition and chapter are in fact linked.
  # Preferably we would request the chapter, with a where clause on
  # linkedFrom.exhibitionPageCollection, but that is not supported by the
  # Contentful GraphQL API.
  query ExhibitionChapterPage(
    $locale: String!,
    $identifier: String!,
    $preview: Boolean = false
  ) {
    exhibitionPageCollection(preview: $preview, locale: $locale, where: { identifier: $identifier }, limit: 1) {
      total
      items {
        name
        identifier
        credits
        hasPartCollection(limit: 40) {
          items {
            name
            identifier
            headline
            description
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
