import { createLocalVue, shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import RelatedChip from '../../../../components/generic/RelatedChip.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const factory = () => shallowMount(RelatedChip, {
  localVue,
  propsData: {
    id: '/collections/topic/190-art',
    title: 'Art'
  }
});

describe('components/generic/RelatedChip', () => {
  it('renders a related collection chip', () => {
    const wrapper = factory();
    wrapper.findAll('[data-qa="related chip"]').length.should.eq(1);
  });

  it('has a collection title, lang and link', () => {
    const wrapper = factory();
    wrapper.setProps({
      id: '/collections/topic/190-art',
      title: 'Art'
    });

    const chip = wrapper.find('[data-qa="related chip"]');
    chip.text().should.eq('Art');
    chip.attributes().to.should.contain('190-art');
  });
});
