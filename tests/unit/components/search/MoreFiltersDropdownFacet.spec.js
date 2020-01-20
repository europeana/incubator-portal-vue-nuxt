import { createLocalVue, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import MoreFiltersDropdownFacet from '../../../../components/search/MoreFiltersDropdownFacet.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const factory = () => mount(MoreFiltersDropdownFacet, {
  localVue,
  mocks: {
    $t: (key) => key,
    $tc: (key) => key,
    $te: (key) => key
  },
  propsData: {
    name: 'LANGUAGE',
    fields: [
      {
        label: 'de',
        count: 123
      },
      {
        label: 'sv',
        count: 12
      }
    ]
  }
});

describe('components/search/MoreFiltersDropdownFacet', () => {
  it('emits `selectedOptions` event when selected method is called', () => {
    const wrapper = factory();
    const checkbox = wrapper.find('[data-qa="de LANGUAGE checkbox"]');

    wrapper.setData({ limitTo: 9 });

    checkbox.trigger('click');
    wrapper.emitted()['selectedOptions'].should.eql([ [ 'LANGUAGE', [ 'de' ] ] ]);
  });
});
