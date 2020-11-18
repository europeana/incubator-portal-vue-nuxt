import { createLocalVue, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import nock from 'nock';
import ItemEmbedCode from '../../../../components/item/ItemEmbedCode.vue';

const OEMBED_BASE_URL = 'https://oembedjs.europeana.eu';
const identifier = '/123/abc';
const html = '<iframe src=""></iframe>';
// const link = 'http://example.org';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('components/item/ItemEmbedCode', () => {
  describe('fetch()', () => {
    // NOTE: fetch() is a Nuxt method, so Vue Test Utils is not aware of it and
    //       it needs to be triggered manually on a mock
    const factory = () => ({
      identifier,
      fetch: ItemEmbedCode.fetch
    });

    beforeEach(() => {
      nock(OEMBED_BASE_URL)
        .get('/')
        .query(query => {
          return query.url === 'http://data.europeana.eu/item/123/abc' && query.format === 'json';
        })
        .reply(200, { html });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('sends an oEmbed request to the Europeana oEmbed provider', async() => {
      const componentMock = factory();

      await componentMock.fetch();

      nock.isDone().should.be.true;
    });

    it('stores html from response body on component embedHtml property', async() => {
      const componentMock = factory();

      await componentMock.fetch();

      componentMock.embedHtml.should.eq(html);
    });
  });

  context('when response includes "html" property', () => {
    const factory = () => mount(ItemEmbedCode, {
      localVue,
      propsData: {
        identifier
      },
      data() {
        return {
          embedHtml: html
        };
      },
      mocks: {
        $t: key => key
      }
    });

    it('is shown in a textarea', () => {
      const wrapper = factory();

      wrapper.find('#shareEmbed').element.value.should.eq(html);
    });

    context('when textarea is clicked', () => {
      it('copies the embed code to the clipboard');
      it('shows a notification message');
    });
  });

  context('when response does not include "html" property', () => {
    it('is not rendered');
  });
});
