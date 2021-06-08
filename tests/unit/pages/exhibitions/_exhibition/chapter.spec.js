import exhibitionChapters from '../../../../../src/mixins/exhibitionChapters';
import { createLocalVue } from '@vue/test-utils';
import { shallowMountNuxt } from '../../../utils';
import BootstrapVue from 'bootstrap-vue';

import page from '../../../../../src/pages/exhibitions/_exhibition/_chapter';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const heroImageUrl = 'http://example.org/contentful/asset.jpg';

const factory = () => shallowMountNuxt(page, {
  localVue,
  mixins: [
    exhibitionChapters
  ],
  data() {
    return {
      chapters: [],
      exhibitionIdentifier: 'exhibition',
      exhibitionTitle: 'exhibition name',
      page: {
        name: '',
        headline: '',
        description: '',
        text: '',
        primaryImageOfPage: {
          image: {
            url: heroImageUrl,
            description: 'Hero image description'
          }
        },
        hasPartCollection: {
          items: []
        }
      }
    };
  },
  mocks: {
    $t: key => key,
    $pageHeadTitle: key => key
  }
});

describe('Exhibition Chapter page', () => {
  describe('head()', () => {
    it('uses hero image for og:image', () => {
      const wrapper = factory();

      const headMeta = wrapper.vm.head().meta;

      headMeta.filter(meta => meta.property === 'og:image').length.should.eq(1);
      headMeta.find(meta => meta.property === 'og:image').content.should.eq(heroImageUrl);
    });
  });
});
