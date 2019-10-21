import { storiesOf } from '@storybook/vue';
import VueRouter from 'vue-router';
import ImageWithAttribution from './ImageWithAttribution.vue';

const i18n = {
  locale: 'en',
  messages: {
    en: {
      directions: { right: 'Right', left: 'Left' }
    }
  }
};

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'root'
    }
  ]
});

ImageWithAttribution.methods.localePath = () => {};

storiesOf('Generic/Image with attribution', module)
  .add('Internal link', () => ({
    components: { ImageWithAttribution },
    i18n,
    router,
    data() {
      return {
        src: 'img/landscape.jpg',
        attribution: {
          name: 'Name',
          creator: 'Creator',
          provider: 'Provider',
          rightsStatement: 'http://creativecommons.org/licenses/by-nd/4.0/',
          url: '/'
        }
      };
    },
    template: ` <b-container
      class="mt-3"
      >
        <ImageWithAttribution
          :src="src"
          :attribution="attribution"
        />
      </b-container>`
  }))
  .add('External link', () => ({
    components: { ImageWithAttribution },
    i18n,
    router,
    data() {
      return {
        src: 'img/landscape.jpg',
        attribution: {
          name: 'Name',
          creator: 'Creator',
          provider: 'Provider',
          rightsStatement: 'http://creativecommons.org/licenses/by-nd/4.0/',
          url: 'https://www.example.org/'
        }
      };
    },
    template: ` <b-container
      class="mt-3"
      >
        <ImageWithAttribution
          :src="src"
          :attribution="attribution"
        />
      </b-container>`
  }));
