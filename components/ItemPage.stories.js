import { storiesOf } from '@storybook/vue';
import VueI18n from 'vue-i18n';
import MediaPresentation from './item/MediaPresentation';
import MediaThumbnailGrid from './item/MediaThumbnailGrid';

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en: {
      'record.view.media': 'View image'
    }
  }
});

storiesOf('Item page', module)
  .add('Image with thumbnails', () => ({
    i18n,
    data() {
      return {
        media: [
          {
            about: 'http://www.mimo-db.eu/media/GNM/IMAGE/MIR1097_1279787057222_2.jpg',
            thumbnails: {
              small: 'https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w200&type=IMAGE&uri=http%3A%2F%2Fwww.mimo-db.eu%2Fmedia%2FGNM%2FIMAGE%2FMIR1097_1279787057222_2.jpg'
            }
          },
          {
            about: 'http://www.mimo-db.eu/media/GNM/IMAGE/MIR1097_1289919650555_2.jpg',
            thumbnails: {
              small: 'https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w200&type=IMAGE&uri=http%3A%2F%2Fwww.mimo-db.eu%2Fmedia%2FGNM%2FIMAGE%2FMIR1097_1289919650555_2.jpg'
            }
          },
          {
            about: 'http://www.mimo-db.eu/media/GNM/IMAGE/MIR1097_1279787078144_2.jpg',
            thumbnails: {
              small: 'https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w200&type=IMAGE&uri=http%3A%2F%2Fwww.mimo-db.eu%2Fmedia%2FGNM%2FIMAGE%2FMIR1097_1279787078144_2.jpg'
            }
          }
        ],
        selected: {
          about: 'http://www.mimo-db.eu/media/GNM/IMAGE/MIR1097_1279787057222_2.jpg'
        }
      };
    },
    methods: {
      selectMedia(about) {
        this.selected = { about };
      }
    },
    components: { MediaPresentation, MediaThumbnailGrid },
    template: `
      <b-container class="mt-3">
        <div class="media-presentation" style="display: inline-block;">
          <MediaPresentation
            europeana-identifier="/"
            :media="selected"
            :image-src="selected.about"
          />
          <MediaThumbnailGrid
            :media="media"
            :selected="selected.about"
            @select="selectMedia"
          />
        </div>
      </b-container>
    `
  }));
