module.exports = function(migration) {
  const latestCardGroup = migration
    .createContentType('latestCardGroup')
    .name('Latest card group')
    .description('A group of 4 latest exhibitions or gallery cards.')
    .displayField('genre');

  latestCardGroup
    .createField('genre')
    .name('Category')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([
      {
        in: ['Exhibitions', 'Galleries']
      },
      {
        unique: true
      }
    ])
    .disabled(false)
    .omitted(false);

  latestCardGroup.changeFieldControl('genre', 'builtin', 'radio', {});

  const browsePage = migration.editContentType('browsePage');

  browsePage
    .editField('hasPart')
    .items({
      type: 'Link',
      validations: [
        {
          linkContentType: ['cardGroup', 'richText', 'latestCardGroup']
        }
      ],
      linkType: 'Entry'
    });
};
