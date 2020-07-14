import { storiesOf } from '@storybook/vue';
import Vuex from 'vuex';
import MoreFiltersDropdown from './MoreFiltersDropdown.vue';

const i18n = {
  locale: 'en',
  messages: {
    en: {
      facets: {
        LANGUAGE: {
          name: 'Language | Languages'
        },
        PROVIDER: {
          name: 'Aggregator | Aggregators'
        },
        DATA_PROVIDER: {
          name: 'Institution | Institutions'
        },
        button: {
          cancel: 'Cancel',
          reset: 'Reset',
          apply: 'Apply',
          morefilters: 'More filters',
          showAll: 'Show all {label}',
          showLess: 'Hide all {label}'
        }
      }
    }
  }
};

const store = () => new Vuex.Store({
  getters: {
    'search/collection': () => ({}),
    'search/formatFacetFieldLabel': () => () => {}
  }
});

storiesOf('Search', module)
  .add('More Filters Dropdown', () => ({
    components: { MoreFiltersDropdown },
    i18n,
    store,
    data() {
      return {
        facets: [
          {
            'name': 'LANGUAGE',
            'fields': [
              {
                'label': 'en',
                'count': 9230749
              },
              {
                'label': 'de',
                'count': 6714554
              },
              {
                'label': 'no',
                'count': 4676848
              },
              {
                'label': 'nl',
                'count': 3991384
              },
              {
                'label': 'sv',
                'count': 3604902
              },
              {
                'label': 'fr',
                'count': 3325609
              },
              {
                'label': 'pl',
                'count': 2722115
              },
              {
                'label': 'es',
                'count': 2138894
              },
              {
                'label': 'it',
                'count': 1788264
              },
              {
                'label': 'da',
                'count': 1012003
              },
              {
                'label': 'fi',
                'count': 938530
              }
            ]
          },
          {
            'name': 'PROVIDER',
            'fields': [
              {
                'label': 'OpenUp!',
                'count': 8117543
              },
              {
                'label': 'The European Library',
                'count': 8098206
              },
              {
                'label': 'LoCloud',
                'count': 3386113
              },
              {
                'label': 'Swedish Open Cultural Heritage | K-samsök',
                'count': 2762220
              },
              {
                'label': 'Federacja Bibliotek Cyfrowych',
                'count': 2002605
              }
            ]
          },
          {
            'name': 'DATA_PROVIDER',
            'fields': [
              {
                'label': 'Naturalis Biodiversity Center',
                'count': 4512439
              },
              {
                'label': 'The National Archives of Norway',
                'count': 2995795
              },
              {
                'label': 'Bibliothèque nationale de France',
                'count': 1596589
              },
              {
                'label': 'Österreichische Nationalbibliothek - Austrian National Library',
                'count': 1499818
              },
              {
                'label': 'The Trustees of the Natural History Museum, London',
                'count': 1451168
              },
              {
                'label': 'National Library of the Netherlands',
                'count': 1294871
              },
              {
                'label': 'National Library of France',
                'count': 1224986
              }
            ]
          }
        ],
        name: 'LANGUAGE',
        selected: {
          LANGUAGE: ['en']
        }
      };
    },
    template: ` <b-container
      class="mt-3"
      >
        <MoreFiltersDropdown
          :more-facets="facets"
          :selected="selected"
          :name="name" />
      </b-container>`
  }));

