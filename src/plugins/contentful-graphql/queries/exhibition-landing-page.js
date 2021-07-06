export default `
  query ExhibitionLandingPage(
    $identifier: String!,
    $locale: String!,
    $preview: Boolean = false
  ) {
    exhibitionPageCollection(preview: $preview, locale: $locale, where: { identifier: $identifier }, limit: 1) {
      items {
        identifier
        name
        headline
        description
        text
        primaryImageOfPage {
          ...imageWithAttributionFields
        }
        hasPartCollection(limit: 20) {
          items {
            name
            identifier
            primaryImageOfPage {
              ...imageWithAttributionFields
            }
          }
        }
        credits
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
    }
  }
`;
