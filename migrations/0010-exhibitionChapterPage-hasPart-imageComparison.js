module.exports = function(migration) {
  const exhibitionChapterPage = migration.editContentType('exhibitionChapterPage');

  exhibitionChapterPage
    .editField('hasPart')
    .items({
      type: 'Link',
      validations: [
        {
          linkContentType: ['cardGroup', 'embed', 'imageComparison', 'imageWithAttribution', 'richText']
        }
      ],
      linkType: 'Entry'
    });
};
