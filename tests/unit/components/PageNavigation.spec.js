import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';

import BootstrapVue from 'bootstrap-vue';
import PageNavigation from '../../../components/PageNavigation.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

const store = new Vuex.Store({
  modules: {
    i18n: {
      state: {
        locale: 'en'
      }
    }
  }
});

const factory = () => mount(PageNavigation, {
  localVue,
  store,
  mocks: {
    $path: code => window.location.href + code
  }
});

describe('components/search/PageNavigation', () => {
  it('retrieves the correct navigation data', () => {
    const wrapper = factory();
    const links = wrapper.find('[data-qa="main navigation"]');

    links.contains('Our partners');
  });
});
