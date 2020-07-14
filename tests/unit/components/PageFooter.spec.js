import { createLocalVue, shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import SmartLink from '../../../components/generic/SmartLink.vue';
import PageFooter from '../../../components/PageFooter.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.component('SmartLink', SmartLink);

const factory = () => shallowMount(PageFooter, {
  localVue,
  mocks: {
    $t: () => {}
  }
});

describe('components/PageFooter', () => {
  it('contains the language selector', () => {
    const wrapper = factory();
    wrapper.setProps({
      enableLanguageSelector: true
    });
    const selector = wrapper.find('[data-qa="language selector"]');

    selector.isVisible().should.equal(true);
  });
});
