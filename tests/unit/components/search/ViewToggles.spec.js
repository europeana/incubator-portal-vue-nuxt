import { createLocalVue, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import VueRouter from 'vue-router';

import ViewToggles from '../../../../components/search/ViewToggles.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/search',
      name: 'search'
    }
  ]
});

const factory = () => {
  return mount(ViewToggles, {
    localVue,
    router,
    mocks: {
      $t: (key) => key,
      localePath: (opts) => opts
    }
  });
};

describe('components/search/ViewToggles', () => {
  const views = ['list', 'grid'];

  for (const view of views) {
    describe(`${view} view`, () => {
      it('has a toggle', () => {
        const wrapper = factory();

        const viewToggle = wrapper.find(`[data-qa="search ${view} view toggle"]`);
        viewToggle.exists().should.eq(true);
      });

      it('links to route with view parameter set', () => {
        const wrapper = factory();

        const viewToggleLink = wrapper.find(`[data-qa="search ${view} view toggle"] a`);
        viewToggleLink.attributes('href').should.match(new RegExp(`[?&]view=${view}(&|$)`));
      });

      it('displays icon', () => {
        const wrapper = factory();

        const viewToggleIcon = wrapper.find(`[data-qa="search ${view} view toggle"] i`);
        viewToggleIcon.attributes('class').should.eq(`icon-view-toggle ${view}`);
      });

      it('changes active view when clicked', () => {
        const wrapper = factory();

        const viewToggle = wrapper.find(`[data-qa="search ${view} view toggle"] a`);
        viewToggle.trigger('click');

        wrapper.vm.activeView.should.eq(view);
      });
    });
  }
});
