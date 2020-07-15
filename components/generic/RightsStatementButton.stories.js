import { storiesOf } from '@storybook/vue';
import VueI18n from 'vue-i18n';
import RightsStatementButton from './RightsStatementButton.vue';

const i18n = new VueI18n();

storiesOf('Generic', module)
  .add('Rights Statement Button', () => ({
    components: { RightsStatementButton },
    i18n,
    data() {
      return {
        rightsStatementIsUrl: true,
        rightsStatement: 'https://creativecommons.org/licenses/by-sa/4.0/'
      };
    },
    template: `
      <b-container
        v-if="rightsStatementIsUrl"
        class="mt-3 bg-white p-5"
      >
        <RightsStatementButton
          v-if="rightsStatementIsUrl"
          :rights-statement="rightsStatement"
        />
      </b-container>`
  }));
