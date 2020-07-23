import { storiesOf } from '@storybook/vue';
import StoryRouter from 'storybook-vue-router';
import MediaCarousel from './MediaCarousel.vue';

storiesOf('Item page/Media Carousel', module)
  .add('Carousel', () => ({
    components: { MediaCarousel },
    template: `
      <b-container class="mt-3">
        <MediaCarousel />
      </b-container>
    `
  }));
  