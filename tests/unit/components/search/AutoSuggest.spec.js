import { createLocalVue, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import AutoSuggest from '../../../../components/search/AutoSuggest.vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
// import sinon from 'sinon';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VueRouter);
localVue.use(Vuex);

const parentInputComponent = {
  name: 'parentInputComponent',
  components: {
    AutoSuggest
  },
  template: '<div><input id="searchbox" ref="searchbox" type="text" /><AutoSuggest /></div>'
};

const factory = (options = {}) => {
  return mount(parentInputComponent, {
    localVue,
    attachToDocument: true,
    mocks: {
      ...{
        $t: () => {},
        $path: (opts) => {
          return router.resolve(opts).route.fullPath;
        }
      }, ...(options.mocks || {})
    },
    store: options.store || store()
  });
};

const store = (options = {}) => {
  return new Vuex.Store({
    state: options.state || {
      i18n: {
        locale: 'en'
      }
    }
  });
};

const query = 'dor';
const suggestions = {
  'http://data.europeana.eu/concept/base/17': 'Dorëshkrimi',
  'http://data.europeana.eu/agent/base/57083': 'Gustave Doré',
  'http://data.europeana.eu/agent/base/146799': 'Doris Day'
};

describe('components/search/AutoSuggest', () => {
  describe('suggestions', () => {
    it('is hidden when there are no suggestions', () => {
      const wrapper = factory();

      wrapper.find('[data-qa="search suggestions"]').isVisible().should.be.false;
    });

    it('is shown when suggestions are set', () => {
      const wrapper = factory();
      const autoSuggestWrapper = wrapper.find('[data-qa="search suggestions"]');

      autoSuggestWrapper.setProps({
        value: suggestions
      });

      autoSuggestWrapper.isVisible().should.be.true;
    });

    it('shows each suggestion', () => {
      const wrapper = factory();
      const autoSuggestWrapper = wrapper.find('[data-qa="search suggestions"]');

      autoSuggestWrapper.setProps({
        value: suggestions
      });

      const suggestionElements = autoSuggestWrapper.findAll('[data-qa="search suggestion"]');
      const suggestionValues = Object.values(suggestions);

      suggestionElements.length.should.eq(suggestionValues.length);

      suggestionValues.forEach((value, index) => {
        value.should.include(suggestionElements.at(index).text());
      });
    });

    it('highlights matching characters', () => {
      const wrapper = factory();
      const autoSuggestWrapper = wrapper.find('[data-qa="search suggestions"]');

      autoSuggestWrapper.setProps({
        value: suggestions,
        query
      });

      const highlightedElements = autoSuggestWrapper.findAll('[data-qa="search suggestion"] [data-qa="highlighted"]');

      highlightedElements.wrappers.forEach((element) => {
        element.text().toLowerCase().should.eq(query.toLowerCase());
      });
    });

    it('is navigable by keyboard on the parent input', () => {
      const wrapper = factory();
      const searchInput = wrapper.find('#searchbox');
      const autoSuggestWrapper = wrapper.find('[data-qa="search suggestions"]');

      autoSuggestWrapper.setProps({
        value: suggestions,
        query
      });

      searchInput.trigger('keyup.down');
      autoSuggestWrapper.vm.focus.should.eq(0);
      searchInput.trigger('keyup.down');
      autoSuggestWrapper.vm.focus.should.eq(1);
      searchInput.trigger('keyup.up');
      autoSuggestWrapper.vm.focus.should.eq(0);
      searchInput.trigger('keyup.up');
      autoSuggestWrapper.vm.focus.should.eq(2);
      searchInput.trigger('keyup.down');
      autoSuggestWrapper.vm.focus.should.eq(0);
    });

    for (const key of ['tab', 'esc']) {
      it(`is closable by ${key} key on the parent input`, () => {
        const wrapper = factory();
        const searchInput = wrapper.find('#searchbox');
        const autoSuggestWrapper = wrapper.find('[data-qa="search suggestions"]');

        autoSuggestWrapper.setProps({
          value: suggestions,
          query
        });

        autoSuggestWrapper.isVisible().should.be.true;

        searchInput.trigger(`keyup.${key}`);
        autoSuggestWrapper.isVisible().should.be.false;
      });
    }
  });
});
