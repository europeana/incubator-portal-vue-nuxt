import { createLocalVue, shallowMount } from '@vue/test-utils';
import ExhibitionChaptersNavigation from '../../../../components/exhibition/ExhibitionChaptersNavigation.vue';
import BootstrapVue from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const $route = {
  params: {
    chapter: 'astilbe'
  }
};

const chapterNavigation = [
  {
    name: 'Allium',
    identifier: 'allium',
    url: 'en/exhibition/flowers/allium'
  },
  {
    name: 'Astilbe',
    identifier: 'astilbe',
    url: 'en/exhibition/flowers/astilbe'
  },
  {
    name: 'Calls for education',
    identifier: 'calls-for-education',
    url: 'en/exhibition/flowers/calls-for-education'
  }
];

const factory = () => shallowMount(ExhibitionChaptersNavigation, {
  localVue,
  stubs: ['b-link'],
  mocks: {
    $route,
    $path: (opts) => opts
  },
  propsData: {
    exhibitionIdentifier: 'flowers',
    chapterNavigation
  }
});

describe('components/exhibition/ExhibitionChaptersNavigation', () => {
  context('when there are both previous and next chapters', () => {
    it('has buttons for both', () => {
      const wrapper = factory();
      const previous = wrapper.find('[data-qa="previous chapter button"]');
      previous.isVisible().should.be.true;

      const next = wrapper.find('[data-qa="next chapter button"]');
      next.isVisible().should.be.true;
    });
  });

  context('when the current chapter is the last chapter', () => {
    it('has a previous chapter button only', () => {
      const wrapper = factory();
      wrapper.vm.currentChapter = 'allium';

      const previous = wrapper.find('[data-qa="previous chapter button"]');
      previous.exists().should.be.false;

      const next = wrapper.find('[data-qa="next chapter button"]');
      next.isVisible().should.be.true;
    });
  });

  context('when the current chapter is the first chapter', () => {
    it('has a next chapter button only', () => {
      const wrapper = factory();
      wrapper.vm.currentChapter = 'calls-for-education';

      const previous = wrapper.find('[data-qa="previous chapter button"]');
      previous.isVisible().should.be.true;

      const next = wrapper.find('[data-qa="next chapter button"]');
      next.exists().should.be.false;
    });
  });
});
