export default `
  query LinkGroups(
    $locale: String!,
    $preview: Boolean = false
  ) {
    footerMoreInfo: linkGroupCollection(preview: $preview, locale: $locale, limit: 1, where: { identifier: "footerMoreInfo" }) {
      ...linkGroupFields
    }
    footerHelp: linkGroupCollection(preview: $preview, locale: $locale, limit: 1, where: { identifier: "footerHelp" }) {
      ...linkGroupFields
    }
  }

  fragment linkGroupFields on LinkGroupCollection {
    items {
      identifier
      name
      links: linksCollection(limit: 10) {
        items {
          text
          url
        }
      }
    }
  }
`;
