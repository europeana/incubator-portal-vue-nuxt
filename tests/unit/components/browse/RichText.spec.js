import { createLocalVue, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';

import RichText from '../../../../components/browse/RichText.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const factory = () => mount(RichText, {
  localVue,
  propsData: {
    text: '__This is bold text__'
  }
});

describe('components/browse/RichText', () => {
  it('shows bold text', () => {
    const wrapper = factory();
    const markdown = wrapper.find('[data-qa="markdown"]');

    markdown.html().should.contain('<strong>This is bold text</strong>');
  });

  it('shows a heading if property exists', () => {
    const wrapper = factory();

    wrapper.setProps({
      headline: 'This will be a title'
    });

    const markdown = wrapper.find('[data-qa="markdown"]');
    markdown.find('h2').text().should.contain('This will be a title');
  });
});
