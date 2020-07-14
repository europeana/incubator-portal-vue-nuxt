import { createLocalVue, shallowMount } from '@vue/test-utils';
// TODO: is this needed?
import BootstrapVue from 'bootstrap-vue';
import Vuex from 'vuex';

import BrowseContentCard from '../../../../components/browse/BrowseContentCard.vue';
import apiConfig from '../../../../modules/apis/defaults';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(Vuex);

const store = new Vuex.Store({
  getters: {
    'apis/config': () => apiConfig
  }
});

const factory = (props = { fields: {} }) => shallowMount(BrowseContentCard, {
  localVue,
  store,
  propsData: props,
  mocks: {
    $path: (opts) => opts,
    $i18n: { locale: 'en' },
    $t: () => {}
  }
});

describe('components/browse/BrowseContentCard', () => {
  describe('title()', () => {
    it('uses `fields.name`', () => {
      const name = 'Content item';
      const wrapper = factory({ fields: { name } });

      wrapper.vm.title.should.eq(name);
    });

    it('uses `dcTitleLangAware`', () => {
      const name = 'Content item';
      const dcTitleLangAware = 'Content item in a language';
      const wrapper = factory({
        cardType: 'AutomatedRecordCard',
        fields: {
          name,
          encoding: {
            dcTitleLangAware
          }
        }
      });

      wrapper.vm.title.should.eq(dcTitleLangAware);
    });
  });

  describe('imageUrl()', () => {
    context('when `fields.thumbnailUrl` is present', () => {
      it('is used', () => {
        const thumbnailUrl = 'https://www.example.org/image.jpg';
        const wrapper = factory({ fields: { thumbnailUrl } });

        wrapper.vm.imageUrl.should.equal(thumbnailUrl);
      });
    });

    context('when `fields.image` is a string', () => {
      it('is used', () => {
        const image = 'https://www.example.org/image.jpg';
        const wrapper = factory({ fields: { image } });

        wrapper.vm.imageUrl.should.equal(image);
      });
    });

    context('when the card is an AutomatedRecordCard and `edmPreview` is present', () => {
      it('is used', () => {
        const edmPreview = 'https://www.example.org/image.jpg';
        const wrapper = factory({
          cardType: 'AutomatedRecordCard',
          fields: {
            encoding: {
              edmPreview: [edmPreview]
            }
          }
        });

        wrapper.vm.imageUrl.should.equal(`${edmPreview}&size=w200`);
      });
    });

    context('when image is a Contentful asset', () => {
      it('uses `fields.image.url`', () => {
        const imageUrl = 'https://images.ctfassets.net/image.jpg';
        const wrapper = factory({ fields: { image: { url: imageUrl } } });

        wrapper.vm.imageUrl.should.equal(imageUrl);
      });
    });

    context('otherwise', () => {
      it('is an empty string', () => {
        const wrapper = factory();

        wrapper.vm.imageUrl.should.equal('');
      });
    });
  });

  describe('destination()', () => {
    context('when `fields.url` is present', () => {
      it('is used', () => {
        const url = 'https://www.example.org/';
        const wrapper = factory({ fields: { url } });

        wrapper.vm.destination.should.equal(url);
      });
    });

    context('when `fields.identifier` is a Europeana record ID', () => {
      it('constructs a route to the record page', () => {
        const identifier = '/123456/abcdef_7890';
        const wrapper = factory({ fields: { identifier } });

        wrapper.vm.destination.should.eql({ name: 'item-all', params: { pathMatch: identifier.slice(1) } });
      });
    });

    context('when `fields.identifier` is a http(s) URL', () => {
      context('and is a Europeana entity URI', () => {
        it('constructs a route to the entity page', () => {
          const entityType = 'agent';
          const entityHumanType = 'person';
          const entityId = '12345';
          const identifier = `http://data.europeana.eu/${entityType}/base/${entityId}`;
          const wrapper = factory({ fields: { identifier } });

          wrapper.vm.destination.should.eql({ name: 'collections-type-all', params: { type: entityHumanType, pathMatch: entityId } });
        });
      });

      context('but is not a Europeana entity URI', () => {
        it('is used', () => {
          const identifier = 'https://www.example.org/';
          const wrapper = factory({ fields: { identifier } });

          wrapper.vm.destination.should.eql(identifier);
        });
      });
    });

    context('otherwise', () => {
      it('is an empty string', () => {
        const wrapper = factory();

        wrapper.vm.destination.should.equal('');
      });
    });
  });

  describe('texts()', () => {
    context('for a curated card', () => {
      it('is includes description', () => {
        const description = 'Some interesting content';
        const wrapper = factory({ fields: { description } });
        wrapper.vm.texts.should.include(description);
      });
    });
    context('for an automated record card', () => {
      it('is includes creator and provider fields, but no description', () => {
        const description = 'Some interesting content';
        const creator = 'A European artist';
        const provider = 'An aggregator';
        const wrapper = factory({ cardType: 'AutomatedRecordCard', fields: { description, creator, provider } });
        wrapper.vm.texts.should.not.include(description);
        wrapper.vm.texts.should.include(creator);
        wrapper.vm.texts.should.include(provider);
      });
      it('is includes dcCreatorLangAware and dataProvider fields', () => {
        const dcCreatorLangAware = 'A European artist';
        const dataProvider = 'An aggregator';
        const wrapper = factory({
          cardType: 'AutomatedRecordCard',
          fields: {
            name,
            encoding: {
              dcCreatorLangAware,
              dataProvider
            }
          }
        });
        wrapper.vm.texts.should.include(dcCreatorLangAware);
        wrapper.vm.texts.should.include(dataProvider);
      });
    });
  });
});
