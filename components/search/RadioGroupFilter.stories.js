import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import Vuex from 'vuex';
import RadioGroupFilter from './RadioGroupFilter.vue';

const i18n = {
  locale: 'en',
  messages: {
    en: {
      facets: {
        api: {
          name: 'Search for',
          options: {
            fulltext: 'Items with full-text',
            metadata: 'Metadata-only items'
          }
        }
      }
    }
  }
};

const store = () => new Vuex.Store({
  actions: {
    'search/setResettableFilter': () => ({})
  },
  getters: {
    'search/formatFacetFieldLabel': () => () => {}
  }
});

storiesOf('Search', module)
  .add('Record API toggle', () => ({
    i18n,
    store,
    components: { RadioGroupFilter },
    methods: {
      log(value) {
        action('Change event emitted')(value);
      }
    },
    data() {
      return {
        selectedOption: 'fulltext'
      };
    },
    template: `<b-container
      class="mt-3"
      >
        <RadioGroupFilter
          facet-name="api"
          :options="['fulltext', 'metadata']"
          selected="fulltext"
          @change="log"
        />
      </b-container>`
  }));
