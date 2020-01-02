import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import RecordApiToggle from './RecordApiToggle.vue';

const i18n = {
  locale: 'en',
  messages: {
    en: {
      facets: {
        api: {
          name: 'Search for',
          options: {
            fulltext: 'Full text',
            metadata: 'Metadata'
          }
        }
      }
    }
  }
};

storiesOf('Search', module)
  .add('Record API toggle', () => ({
    i18n,
    components: { RecordApiToggle },
    methods: {
      log(value) {
        action('Change event emitted')(value);
      }
    },
    data() {
      return {
        preSelected: 'fulltext'
      };
    },
    template: ` <b-container
      class="mt-3"
      >
        <RecordApiToggle
          @change="log"
        />
      </b-container>`
  }));
