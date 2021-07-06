export default `
  query ExhibitionCreditsPage(
    $locale: String!,
    $identifier: String!,
    $preview: Boolean = false
  ) {
    exhibitionPageCollection(preview: $preview, locale: $locale, where: { identifier: $identifier }, limit: 1) {
      items {
        name
        identifier
        credits
        hasPartCollection(limit: 20) {
          items {
            identifier
            name
            primaryImageOfPage {
              image {
                url
                contentType
              }
            }
          }
        }
      }
    }
  }
`;
