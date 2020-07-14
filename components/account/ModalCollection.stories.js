import { storiesOf } from '@storybook/vue';
import VueI18n from 'vue-i18n';
import ModalCollection from './ModalCollection.vue';

const i18n = new VueI18n();

storiesOf('User/Collection', module)
  .add('Modal', () => ({
    i18n,
    components: { ModalCollection },
    data() {
      return {
        collections: [
          { name: 'My first collection (private)', count: 12 },
          { name: 'Beautiful flowers (private)', count: 16 }
        ]
      };
    },
    template: ` <b-container
      class="mt-3"
      >
        <b-button @click="$bvModal.show('modal-collection')">Add to collection</b-button>
        <ModalCollection
          :collections="collections"
        />
      </b-container>`
  }));
