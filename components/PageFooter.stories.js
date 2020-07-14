import { storiesOf } from '@storybook/vue';
import Vuex from 'vuex';
import StoryRouter from 'storybook-vue-router';
import VueI18n from 'vue-i18n';
import PageFooter from './PageFooter.vue';

const store = new Vuex.Store({
  state: {
    'link-group': {
      data: {
        footerMoreInfo: {
          name: 'More info',
          links: [
            {
              text: 'About Europeana',
              url: '/'
            }
          ]
        },
        footerHelp: {
          name: 'Help',
          links: [
            {
              text: 'Help',
              url: '/'
            }
          ]
        }
      }
    },
    i18n: {
      locale: 'en'
    }
  }
});

const i18n = new VueI18n({
  locale: 'en',
  locales: [{ code: 'en', name: 'English' }],
  messages: {
    en: {
      footer: {
        ourMission: 'Our mission',
        findUsElsewhere: 'Find us else where',
        disclaimerLine1: 'Europeana is an initiative of the European Union, financed by the European Union’s Connecting Europe Facility and European Union Member States. The Europeana services, including this website, are operated by a consortium led by the Europeana Foundation under a service contract with the European Commission.',
        disclaimerLine2: 'The European Commission does not guarantee the accuracy of the information and accepts no responsibility or liability whatsoever with regard to the information on this website. Neither the European Commission, nor any person acting on the European Commission’s behalf, is responsible or liable for the accuracy or use of the information on this website.',
        customiseWebsiteLanguage: 'Customise website language',
        ourMissionQuote: 'Europeana empowers the cultural heritage sector in its digital transformation. We develop expertise, tools and policies to embrace digital change and encourage partnerships that foster innovation.'
      }
    }
  }
});

storiesOf('Design', module)
  .addDecorator(StoryRouter({}, {
    routes: [
      { query: '', path: '' }
    ]
  }))
  .add('Page Footer', () => ({
    store,
    i18n,
    components: { PageFooter },
    template: `
      <b-container class="mt-3">
        <PageFooter />
      </b-container>
    `
  }));
