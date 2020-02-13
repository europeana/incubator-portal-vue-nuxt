import { createLocalVue, shallowMount } from '@vue/test-utils';
import SocialShare from '../../../../components/generic/SocialShare.vue';

const localVue = createLocalVue();
const factory = () => shallowMount(SocialShare, {
  localVue,
  stubs: ['b-link'],
  propsData: {
    mediaUrl: '/img/portrait.jpg',
    shareUrl: 'https://www.example.com/page'
  },
  mocks: {
    $t: () => {}
  }
});

describe('components/generic/SocialShare', () => {
  context('when there are social share buttons', () => {
    it('one button has a facebook share url', () => {
      const wrapper = factory();
      const facebook = wrapper.find('[data-qa="share facebook button"]');

      facebook.attributes().href.should.startWith('https://www.facebook.com/sharer/sharer.php');
      facebook.attributes().href.should.contain('https://www.example.com/page');
    });

    it('one button has a twitter share url', () => {
      const wrapper = factory();
      const twitter = wrapper.find('[data-qa="share twitter button"]');

      twitter.attributes().href.should.startWith('https://twitter.com/intent/tweet');
      twitter.attributes().href.should.contain('https://www.example.com/page');
    });

    it('one button has a pinterest share url', () => {
      const wrapper = factory();
      const pinterest = wrapper.find('[data-qa="share pinterest button"]');

      pinterest.attributes().href.should.startWith('https://pinterest.com/pin/create/link');
      pinterest.attributes().href.should.contain('https://www.example.com/page');
      pinterest.attributes().href.should.contain('/img/portrait.jpg');
    });
  });
});
