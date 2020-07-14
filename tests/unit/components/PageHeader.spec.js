import { createLocalVue, shallowMount } from '@vue/test-utils';
import PageHeader from '../../../components/PageHeader.vue';
import BootstrapVue from 'bootstrap-vue';
import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

const factory = (options = {}) => shallowMount(PageHeader, {
  localVue,
  mocks: {
    $t: () => {},
    $path: (code) => window.location.href + code
  },
  stubs: {
    transition: true
  },
  store: options.store || store({ ui: {} })
});

const getters = {
  'ui/searchView': (state) => state.ui.showSearch
};
const store = (uiState = {}) => {
  return new Vuex.Store({
    getters,
    state: {
      ui: uiState,
      'link-group': {
        data: {
          mainNavigation: {
            links: [
              {
                text: 'Collections',
                url: '/collections'
              }
            ]
          },
          mobileNavigation: {
            links: [
              {
                text: 'Our partners',
                url: '/about/our-partners'
              }
            ]
          }
        }
      }
    }
  });
};

describe('components/PageHeader', () => {
  it('contains a search form', () => {
    const wrapper = factory({
      store: store({
        showSearch: true
      })
    });
    const form = wrapper.find('[data-qa="search form"]');
    form.isVisible().should.equal(true);
  });

  it('contains the logo', () => {
    const wrapper = factory({
      store: store({
        showSearch: false
      })
    });

    const logo = wrapper.find('[data-qa="logo"]');
    logo.attributes().src.should.match(/\/logo\..+\.svg$/);
  });

  it('contains the desktop nav', () => {
    const wrapper = factory({
      store: store({
        showSearch: false
      })
    });

    const nav = wrapper.find('b-navbar-stub[data-qa="desktop navigation"]');
    nav.isVisible().should.equal(true);
    nav.attributes().class.should.contain('d-lg-block');
  });

  it('contains the mobile navigation toggle button', () => {
    const wrapper = factory({
      store: store({
        showSearch: false
      })
    });
    const sidebarButton = wrapper.find('b-button-stub.navbar-toggle');
    sidebarButton.isVisible().should.equal(true);
  });

  it('shows the mobile nav when the sidebar is visible', () => {
    const wrapper = factory({
      store: store({
        showSearch: false
      })
    });
    wrapper.setData({
      showSidebar: true
    });
    const nav = wrapper.find('[data-qa="mobile navigation"]');
    nav.attributes().class.should.contain('d-lg-none');
    nav.isVisible().should.equal(true);
  });
});
