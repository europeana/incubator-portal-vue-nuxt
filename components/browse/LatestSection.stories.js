import { storiesOf } from '@storybook/vue';
import VueI18n from 'vue-i18n';
import LatestSection from './LatestSection.vue';

const i18n = new VueI18n({
  isoLocale: () => ({})
});

storiesOf('Generic', module)
  .add('Latest Section', () => ({
    components: { LatestSection },
    i18n,
    template: `
      <b-container class="mt-3">
        <LatestSection
          category="Exhibitions"
        />
      </b-container>
    `
  }));

storiesOf('Generic/Messages', module)
  .add('Toast', () => ({
    i18n,
    data() {
      return {
        toggle: false
      };
    },
    methods: {
      toggleToast() {
        if (this.toggle) {
          this.toggle = false;
          this.$bvToast.hide('tier-toast');
        } else {
          this.toggle = true;
          this.$bvToast.show('tier-toast');
        }
      }
    },
    template: `<b-container class="mt-3">
      <b-button
        variant="primary"
        class="mr-3"
        @click="toggleToast"
      >
        {{ toggle ? 'Hide' : 'Show' }} Toast
      </b-button>
      <b-toast
        id="tier-toast"
        toast-class="brand-toast"
        toaster="b-toaster-bottom-left"
        auto-hide-delay="10000"
        is-status
        no-close-button
        solid
        data-qa="tier toast"
      >
        This is a toast notification
      </b-toast>
      </b-container>`
  }));
