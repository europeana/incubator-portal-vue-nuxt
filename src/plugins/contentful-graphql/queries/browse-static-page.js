export default `
  query BrowseStaticPage(
    $identifier: String!,
    $locale: String!,
    $preview: Boolean = false
  ) {
    browsePageCollection(preview: $preview, locale: $locale, where: { identifier: $identifier }, limit: 1) {
      items {
        identifier
        name
        headline
        description
        primaryImageOfPage {
           __typename
          ... on HeroHeader{
            title
            headline
            link {
              ... linkFields
            }
            image {
             ... imageWithAttributionFields
            }
          }
        }
        image {
          url
          contentType
          description
        }
        hasPartCollection(limit: 20) {
          items {
            __typename
            ... on CardGroup {
              headline
              text
              hasPartCollection(limit: 28) {
                items {
                  __typename
                  ... on AutomatedEntityCard {
                    name
                    identifier
                    description
                    slug
                    entityImage: image
                  }
                  ... on AutomatedRecordCard {
                    identifier
                    encoding
                  }
                  ... on CuratedCard {
                    name
                    description
                    url
                    image {
                      url
                      contentType
                      description
                    }
                  }
                }
              }
              moreButton {
                url
                text
              }
            }
            ... on LatestCardGroup {
              genre
            }
            ... on ContentTypeRichText {
              text
            }
          }
        }
      }
    }
    staticPageCollection(preview: $preview, locale: $locale, where: { identifier: $identifier }, limit: 1) {
      items {
        identifier
        name
        description
        primaryImageOfPage {
            ...imageWithAttributionFields
        }
        image {
          url
          contentType
          description
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
          }
        }
        relatedLinks {
            ...linkGroupFields
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
      contentType
      description
      width
      height
    }
  }
  fragment linkFields on Link {
    url
    text
  }
  fragment linkGroupFields on LinkGroup {
    identifier
    name
    links: linksCollection(limit: 10) {
        items {
          text
          url
        }
    }
  }
`;
