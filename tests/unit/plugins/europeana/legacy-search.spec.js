import legacyUrl from '../../../../plugins/europeana/legacy-search';

describe('plugins/europeana/legacy-search', () => {
  let locale = 'en';
  describe('legacyUrl()', () => {
    context('for a blank search', () => {
      const searchParams = { query: '' };
      it('redirects to the classic portal', () => {
        const redirectUrl = legacyUrl(searchParams, locale);
        redirectUrl.should.eq('https://classic.europeana.eu/portal/en/search?q=&view=grid');
      });
    });

    context('for a simple search', () => {
      const searchParams = { query: 'test' };
      it('redirects to the classic portal', () => {
        const redirectUrl = legacyUrl(searchParams, locale);
        redirectUrl.should.eq('https://classic.europeana.eu/portal/en/search?q=test&view=grid');
      });
    });

    context('for a search with facets', () => {
      const searchParams = { query: '', qf: ['COUNTRY:"Germany"', 'TYPE:"IMAGE"', 'TYPE:"TEXT"'] };
      it('redirects to the classic portal reformatting the params', () => {
        const redirectUrl = legacyUrl(searchParams, locale);
        redirectUrl.should.eq('https://classic.europeana.eu/portal/en/search?q=&f[COUNTRY][]=Germany&f[TYPE][]=IMAGE&f[TYPE][]=TEXT&view=grid');
      });
    });

    context('for a search with a reusability facet', () => {
      const searchParams = { query: '', reusability: 'open' };
      it('redirects to the classic portal reformatting the params', () => {
        const redirectUrl = legacyUrl(searchParams, locale);
        redirectUrl.should.eq('https://classic.europeana.eu/portal/en/search?q=&f[REUSABILITY][]=open&view=grid');
      });
    });

    context('for blank search within a collection', () => {
      const searchParams = { query: '', qf: ['collection:ww1'] };
      it('returns the classic portal URL for the collection search', () => {
        const redirectUrl = legacyUrl(searchParams, locale);
        redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/world-war-I?q=&view=grid');
      });
    });

    context('for a simple search within a collection', () => {
      const searchParams = { query: 'test', qf: ['collection:ww1'] };
      it('returns the classic portal URL for the collection search', () => {
        const redirectUrl = legacyUrl(searchParams, locale);
        redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/world-war-I?q=test&view=grid');
      });
    });

    context('for the newspapers collection', () => {
      let newspaperQfParam = 'collection:newspaper';
      context('for a simple a fulltext search', () => {
        const searchParams = { query: 'test', qf: [newspaperQfParam], api: 'fulltext' };
        it('returns the classic portal URL for the collection search', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/newspapers?q=test&f[api][]=collection&view=grid');
        });
      });

      context('for a simple a metadata search', () => {
        const searchParams = { query: 'test', qf: [newspaperQfParam], api: 'metadata' };
        it('returns the classic portal URL for the collection search', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/newspapers?q=test&f[api][]=default&view=grid');
        });
      });

      context('for a search filtering by a start date', () => {
        const searchParams = { query: 'test', qf: [newspaperQfParam, 'proxy_dcterms_issued:[1900-01-01 TO *]'], api: 'fulltext' };
        it('returns the classic portal URL for the collection search', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/newspapers?q=test&range[proxy_dcterms_issued][begin]=1900-01-01&range[proxy_dcterms_issued][end]=*&f[api][]=collection&view=grid');
        });
      });

      context('for a search filtering by an end date', () => {
        const searchParams = { query: 'test', qf: [newspaperQfParam, 'proxy_dcterms_issued:[* TO 2000-12-31]'], api: 'fulltext' };
        it('returns the classic portal URL for the collection search', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/newspapers?q=test&range[proxy_dcterms_issued][begin]=*&range[proxy_dcterms_issued][end]=2000-12-31&f[api][]=collection&view=grid');
        });
      });

      context('for a search filtering by start and end date', () => {
        const searchParams = { query: 'test', qf: [newspaperQfParam, 'proxy_dcterms_issued:[1900-01-01 TO 2000-12-31]'], api: 'fulltext' };
        it('returns the classic portal URL for the collection search', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/newspapers?q=test&range[proxy_dcterms_issued][begin]=1900-01-01&range[proxy_dcterms_issued][end]=2000-12-31&f[api][]=collection&view=grid');
        });
      });

      context('for a search filtering by a specific date', () => {
        const searchParams = { query: 'test', qf: [newspaperQfParam, 'proxy_dcterms_issued:1940-12-01'], api: 'fulltext' };
        it('returns the classic portal URL for the collection search', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/newspapers?q=test&range[proxy_dcterms_issued][begin]=1940-12-01&range[proxy_dcterms_issued][end]=1940-12-01&f[api][]=collection&view=grid');
        });
      });
    });

    context('for the fashion collection', () => {
      let fashionQfParam = 'collection:fashion';
      context('for a simple a fulltext search', () => {
        const searchParams = { query: 'test', qf: [fashionQfParam, 'CREATOR:"Chanel (Designer)"', 'CREATOR:"Valens (Designer)"', 'proxy_dc_format.en:"Technique: weaving techniques"', 'proxy_dc_type.en:"Object Type: ensemble"', 'proxy_dcterms_medium.en:"Material: silk"'] };
        it('returns the classic portal URL for the collection search', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/fashion?q=test&f[CREATOR][]=Chanel%20(Designer)&f[CREATOR][]=Valens%20(Designer)&f[proxy_dc_format.en][]=Technique%3A%20weaving%20techniques&f[proxy_dc_type.en][]=Object%20Type%3A%20ensemble&f[proxy_dcterms_medium.en][]=Material%3A%20silk&view=grid');
        });
      });
    });

    context('for a specific view', () => {
      context('for the grid view', () => {
        const searchParams = { view: 'grid' };
        it('returns the classic portal URL with the view', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/search?q=&view=grid');
        });
      });
      context('for the list view', () => {
        const searchParams = { view: 'list' };
        it('returns the classic portal URL with the view', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/search?q=&view=list');
        });
      });
      context('for the list view', () => {
        const searchParams = {};
        it('returns the classic portal URL with the default JS portal view', () => {
          const redirectUrl = legacyUrl(searchParams, locale);
          redirectUrl.should.eq('https://classic.europeana.eu/portal/en/search?q=&view=grid');
        });
      });
    });

    context('for the migration collection', () => {
      // let migrationQfParam = 'collection:migration';
      context('for a simple search only containing User generated Content', () => {
        // Pending
        // const searchParams = { query: 'test', qf: [migrationQfParam] };
        // it('returns the classic portal URL for the collection search', () => {
        //   const redirectUrl = legacyUrl(searchParams, locale);
        //   redirectUrl.should.eq('https://classic.europeana.eu/portal/en/collections/migration?q=test&&f[edm_UGC][]=true');
        // });
      });
    });
  });
});
