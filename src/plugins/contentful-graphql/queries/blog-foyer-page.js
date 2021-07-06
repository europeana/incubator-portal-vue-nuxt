export default `
  query BlogFoyerPage(
    $locale: String!,
    $preview: Boolean = false,
    $limit: Int = 20,
    $skip: Int = 0
  ) {
    blogPostingCollection(preview: $preview, locale: $locale, order: datePublished_DESC, limit: $limit, skip: $skip) {
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
        datePublished
      }
    }
  }
`;
