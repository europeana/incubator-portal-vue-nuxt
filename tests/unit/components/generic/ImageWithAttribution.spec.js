import { createLocalVue, shallowMount } from '@vue/test-utils';
import ImageWithAttribution from '../../../../components/generic/ImageWithAttribution.vue';
import BootstrapVue from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const propsData = {
  src: 'https://www.example.org/image.jpeg',
  attribution: {
    name: 'Something',
    creator: 'Someone',
    provider: 'Somewhere',
    rightsStatement: 'http://creativecommons.org/licenses/by-nd/4.0/',
    url: 'http://www.example.org/'
  }
};

const factory = () => shallowMount(ImageWithAttribution, {
  localVue,
  propsData
});

describe('components/generic/ImageWithAttribution', () => {
  it('renders the image', () => {
    const wrapper = factory();
    const image = wrapper.find('figure [data-qa="image"]');
    image.attributes().src.should.eq(propsData.src);
  });

  it('renders the attribution', () => {
    const wrapper = factory();
    wrapper.vm.toggleCite();
    const attribution = wrapper.find('figure [data-qa="attribution"]');
    attribution.attributes().url.should.eq(propsData.attribution.url);
  });
});
