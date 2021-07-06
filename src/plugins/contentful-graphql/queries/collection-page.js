export default `
  query CollectionPage(
    $locale: String!,
    $identifier: String!,
    $preview: Boolean = false
  ) {
    entityPage: entityPageCollection(limit: 1, where: { identifier: $identifier }) {
      items {
        name
        description
        identifier
        genre
        primaryImageOfPage {
          url
          image {
            url
            description
            contentType
          }
        }
        relatedLinksCollection(limit: 4) {
          items {
            identifier
            name
            slug
            description
            image
          }
        }
        hasPartCollection(limit: 20) {
          items {
            __typename
            ... on ContentTypeRichText {
              text
            }
            ... on CardGroup {
              headline
              text
              # TODO: reduce this limit in CTF content model?
              hasPartCollection(limit: 60) {
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
                      description
                      contentType
                    }
                  }
                }
              }
              moreButton {
                url
                text
              }
            }
          }
        }
      }
    }
    curatedEntities: entityPageCollection(preview: $preview, locale: $locale, limit: 1000) {
      items {
        name
        identifier
        genre
      }
    }
  }
`;
