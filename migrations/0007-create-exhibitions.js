module.exports = function(migration) {
  const exhibitionPage = migration
    .createContentType('exhibitionPage')
    .name('Exhibition Landing Page')
    .description(
      'An Exhibition index page, links Exhibition chapters together.'
    )
    .displayField('name');
  exhibitionPage
    .createField('name')
    .name('Title')
    .type('Symbol')
    .localized(true)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);

  exhibitionPage
    .createField('identifier')
    .name('URL slug')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([
      {
        unique: true
      }
    ])
    .disabled(false)
    .omitted(false);

  exhibitionPage
    .createField('headline')
    .name('Headline')
    .type('Symbol')
    .localized(true)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);
  exhibitionPage
    .createField('description')
    .name('Description')
    .type('Symbol')
    .localized(true)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  exhibitionPage
    .createField('text')
    .name('Text')
    .type('Text')
    .localized(true)
    .required(false)
    .validations([
      {
        size: {
          max: 2000
        }
      }
    ])
    .disabled(false)
    .omitted(false);

  exhibitionPage
    .createField('primaryImageOfPage')
    .name('Hero image')
    .type('Link')
    .localized(false)
    .required(false)
    .validations([
      {
        linkContentType: ['imageWithAttribution']
      }
    ])
    .disabled(false)
    .omitted(false)
    .linkType('Entry');

  exhibitionPage
    .createField('hasPart')
    .name('Chapters')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',

      validations: [
        {
          linkContentType: ['exhibitionChapterPage']
        }
      ],

      linkType: 'Entry'
    });

  exhibitionPage
    .createField('credits')
    .name('Credits')
    .type('Text')
    .localized(true)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);
  exhibitionPage.changeFieldControl('name', 'builtin', 'singleLine', {});

  exhibitionPage.changeFieldControl('identifier', 'builtin', 'slugEditor', {
    helpText: 'Will always be prefixed with "/exhibition/"'
  });

  exhibitionPage.changeFieldControl('headline', 'builtin', 'singleLine', {
    helpText:
      'For the secondary text over the hero image only, appears under the title.'
  });

  exhibitionPage.changeFieldControl('description', 'builtin', 'singleLine', {});
  exhibitionPage.changeFieldControl('text', 'builtin', 'markdown', {});
  exhibitionPage.changeFieldControl(
    'primaryImageOfPage',
    'builtin',
    'entryLinkEditor',
    {}
  );

  exhibitionPage.changeFieldControl('hasPart', 'builtin', 'entryCardsEditor', {
    bulkEditing: false
  });

  exhibitionPage.changeFieldControl('credits', 'builtin', 'markdown', {});
  const exhibitionChapterPage = migration
    .createContentType('exhibitionChapterPage')
    .name('Exhibition Chapter Page')
    .description(
      'An Exhibition Chapter, consisting of multiple content sections. Relates to sibling chapters through a parent Exhibition Page.'
    )
    .displayField('name');

  exhibitionChapterPage
    .createField('name')
    .name('Title')
    .type('Symbol')
    .localized(true)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);

  exhibitionChapterPage
    .createField('identifier')
    .name('URL slug')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([
      {
        prohibitRegexp: {
          pattern: '^credits$',
          flags: null
        },

        message:
          'You may not use the slug \'credits\' as this page will be automatically generated. Set contents for the credits page on the exhibiton landing page itself.'
      }
    ])
    .disabled(false)
    .omitted(false);

  exhibitionChapterPage
    .createField('headline')
    .name('headline')
    .type('Symbol')
    .localized(true)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  exhibitionChapterPage
    .createField('description')
    .name('Description')
    .type('Symbol')
    .localized(true)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  exhibitionChapterPage
    .createField('primaryImageOfPage')
    .name('Hero image')
    .type('Link')
    .localized(false)
    .required(false)
    .validations([
      {
        linkContentType: ['imageWithAttribution']
      }
    ])
    .disabled(false)
    .omitted(false)
    .linkType('Entry');

  exhibitionChapterPage
    .createField('hasPart')
    .name('Sections')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',

      validations: [
        {
          linkContentType: ['cardGroup', 'embed', 'imageWithAttribution', 'richText']
        }
      ],

      linkType: 'Entry'
    });

  exhibitionChapterPage.changeFieldControl('name', 'builtin', 'singleLine', {});

  exhibitionChapterPage.changeFieldControl(
    'identifier',
    'builtin',
    'slugEditor',
    {
      helpText:
        'Will automatically be prefixed with "/exhibition/EXHIBITION_SLUG/"'
    }
  );

  exhibitionChapterPage.changeFieldControl(
    'headline',
    'builtin',
    'singleLine',
    {
      helpText:
        'For the secondary text over the hero image only, appears under the title.'
    }
  );
  exhibitionChapterPage.changeFieldControl('description', 'builtin', 'singleLine', {});
  exhibitionChapterPage.changeFieldControl(
    'primaryImageOfPage',
    'builtin',
    'entryLinkEditor',
    {}
  );

  exhibitionChapterPage.changeFieldControl(
    'hasPart',
    'builtin',
    'entryLinksEditor',
    {
      bulkEditing: false
    }
  );
};
