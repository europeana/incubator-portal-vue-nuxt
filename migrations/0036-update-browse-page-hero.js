module.exports = function(migration) {
  const heroHeader = migration
    .createContentType('heroHeader')
    .name('Hero Header')
    .description('Hero with text and image.')
    .displayField('title');

  heroHeader
    .createField('title')
    .name('Title')
    .type('Symbol')
    .localized(true)
    .required(true)
    .validations([
      {
        size: {
          max: 100
        }
      }
    ])
    .disabled(false)
    .omitted(false);

  heroHeader
    .createField('headline')
    .name('Headline')
    .type('Symbol')
    .localized(true)
    .required(true)
    .validations([
      {
        size: {
          max: 100
        }
      }
    ])
    .disabled(false)
    .omitted(false);

  heroHeader
    .createField('image')
    .name('Image')
    .type('Link')
    .localized(false)
    .required(true)
    .validations([
      {
        linkContentType: ['imageWithAttribution']
      }
    ])
    .disabled(false)
    .omitted(false)
    .linkType('Entry');

  heroHeader
    .createField('link')
    .name('Link')
    .type('Link')
    .localized(false)
    .required(false)
    .validations([
      {
        linkContentType: ['link']
      }
    ])
    .disabled(false)
    .omitted(false)
    .linkType('Entry');

  heroHeader.changeFieldControl('title', 'builtin', 'singleLine', {});
  heroHeader.changeFieldControl('headline', 'builtin', 'singleLine', {});
  heroHeader.changeFieldControl('image', 'builtin', 'entryLinkEditor', {});
  heroHeader.changeFieldControl('link', 'builtin', 'entryLinkEditor', {});

  const browsePage = migration.editContentType('browsePage');

  browsePage
    .editField('primaryImageOfPage')
    .validations([
      {
        linkContentType: ['heroHeader', 'imageWithAttribution']
      }
    ]);
};
