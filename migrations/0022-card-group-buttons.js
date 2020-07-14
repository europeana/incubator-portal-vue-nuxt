module.exports = function(migration) {
  const cardGroup = migration.editContentType('cardGroup');
  cardGroup.createField('moreButton')
    .name('More Button')
    .type('Link')
    .linkType('Entry')
    .required(false)
    .validations([
      {
        linkContentType: ['link']
      }
    ])
    .disabled(false)
    .omitted(false);
};
