import { storiesOf } from '@storybook/vue';
import VueI18n from 'vue-i18n';
import ContentCardSection from './browse/ContentCardSection.vue';

const i18n = new VueI18n();

storiesOf('Generic', module)
  .add('Section with content cards', () => ({
    components: { ContentCardSection },
    i18n,
    data() {
      return {
        section: {
          fields: {
            headline: 'Art',
            text: 'Discover inspiring art, artists and stories in 2,165,362 artworks from European museums, galleries, libraries and archives',
            hasPart: [
              {
                sys: {
                  id: '123456'
                },
                fields: {
                  name: 'Jonas Martinaitis. Piemenų landynė. 1942 | Jonas Martinaitis',
                  image: {
                    fields: {
                      file: {
                        url: 'img/landscape.jpg'
                      }
                    }
                  },
                  url: 'http://europeana.eu'
                }
              },
              {
                sys: {
                  id: '6789'
                },
                fields: {
                  name: 'Kanutas Ruseckas. Mitologinė pastoralinė scena. XIX a. | Kanutas Ruseckas',
                  image: {
                    fields: {
                      file: {
                        url: 'img/landscape.jpg'
                      }
                    }
                  },
                  url: 'http://europeana.eu'
                }
              },
              {
                sys: {
                  id: '98765'
                },
                fields: {
                  name: 'Jonas Mackevičius. Anykščių bažnyčia. XX a. I p. | Jonas Mackevičius',
                  image: {
                    fields: {
                      file: {
                        url: 'img/landscape.jpg'
                      }
                    }
                  },
                  url: 'http://europeana.eu'
                }
              },
              {
                sys: {
                  id: '43210'
                },
                fields: {
                  name: 'Juozapas Kamarauskas. Vilniaus muitinės pastatas. 1920 | Juozapas Kamarauskas',
                  image: {
                    fields: {
                      file: {
                        url: 'img/landscape.jpg'
                      }
                    }
                  },
                  url: 'http://europeana.eu'
                }
              }
            ]
          }
        }
      };
    },
    template: `<b-container class="mt-3">
      <ContentCardSection
        :section="section"
      />
    </b-container>`
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
