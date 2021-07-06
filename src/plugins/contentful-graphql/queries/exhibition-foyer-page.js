export default `
  query ExhibitionFoyerPage(
    $locale: String!,
    $preview: Boolean = false,
    $limit: Int = 20,
    $skip: Int = 0
  ) {
    exhibitionPageCollection(preview: $preview, locale: $locale, order: datePublished_DESC, limit: $limit, skip: $skip) {
      total
      items {
        identifier
        name
        description
        primaryImageOfPage {
          image {
            url
            description
            contentType
          }
        }
      }
    }
  }
`;
