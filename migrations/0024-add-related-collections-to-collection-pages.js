module.exports = function(migration) {
  const cardGroup = migration.editContentType('entityPage');
  cardGroup.createField('relatedLinks')
    .name('Related collection cards')
    .type('Array')
    .localized(false)
    .validations([
      {
        size: {
          max: 4
        }
      }
    ])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [
        {
          linkContentType: ['automatedEntityCard']
        }
      ],
      linkType: 'Entry'
    });
};
