import store from '../../../../../modules/http/templates/store';

describe('http/store', () => {
  describe('getters', () => {
    describe('canonicalUrlWithoutLocale()', () => {
      context('when `canonicalUrl` has two-letter locale', () => {
        const state = {};
        const getters = { canonicalUrl: 'http://www.example.org/en/about-us' };

        it('is removed', () => {
          store.getters.canonicalUrlWithoutLocale(state, getters).should.eq('http://www.example.org/about-us');
        });
      });

      context('when `canonicalUrl` has no locale', () => {
        const state = {};
        const getters = { canonicalUrl: 'http://www.example.org/about-us' };

        it('is returned as-is', () => {
          store.getters.canonicalUrlWithoutLocale(state, getters).should.eq('http://www.example.org/about-us');
        });
      });
    });
  });
});
