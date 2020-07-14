import { storiesOf } from '@storybook/vue';
import VueI18n from 'vue-i18n';

const i18n = new VueI18n();

storiesOf('Design', module)
  .add('Typography', () => ({
    i18n,
    template: `<b-container class="mt-3">
        <h1>This is a h1 heading</h1>
        <h2>This is a h2 heading</h2>
        <h3>This is a h3 heading</h3>
        <h4>This is a h4 heading</h4>
        <h5>This is a h5 heading</h5>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam iaculis odio sit amet ligula laoreet semper. Nunc nisl massa, bibendum mattis efficitur id,
          maximus at massa. In mauris justo, aliquam eu hendrerit vel, accumsan vitae metus. Aliquam et enim leo. Morbi ac lacinia erat. Vivamus sagittis, enim eget
          molestie sodales, massa lacus luctus sapien, nec tristique enim nunc a nulla. Donec laoreet viverra est, at maximus felis lacinia in. Fusce gravida, purus
          ac ullamcorper dapibus, dolor lorem viverra neque, et scelerisque elit metus eu urna. Fusce a mi malesuada arcu dignissim condimentum nec eget nisl. Nulla
          blandit mi eu pulvinar facilisis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis justo eu mauris ornare consectetur. Fusce mollis,
          mauris facilisis fermentum finibus, felis justo sagittis enim, a ultrices velit mauris nec orci. Phasellus fermentum commodo enim tincidunt tincidunt.
        </p>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam iaculis odio sit amet ligula laoreet semper. Nunc nisl massa, bibendum mattis efficitur id,
          maximus at massa. In mauris justo, aliquam eu hendrerit vel, accumsan vitae metus. Aliquam et enim leo. Morbi ac lacinia erat. Vivamus sagittis, enim eget
          molestie sodales, massa lacus luctus sapien, nec tristique enim nunc a nulla. Donec laoreet viverra est, at maximus felis lacinia in. Fusce gravida, purus
          ac ullamcorper dapibus, dolor lorem viverra neque, et scelerisque elit metus eu urna. Fusce a mi malesuada arcu dignissim condimentum nec eget nisl. Nulla
          blandit mi eu pulvinar facilisis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis justo eu mauris ornare consectetur. Fusce mollis,
          mauris facilisis fermentum finibus, felis justo sagittis enim, a ultrices velit mauris nec orci. Phasellus fermentum commodo enim tincidunt tincidunt.
        </p>

        <p><small>This is small text</small></p>
        <p><small><strong>This is small and bold text</strong></small></p>

        <p><small class="xs">This is extra small text</small></p>
        <p><small class="xs">This is extra small and bold text</small></p>

        <p><small class="xxs">This is super small text</small></p>

        <ul>
          <li>m nunc a nulla. Donec l</li>
          <li>ec eget nisl. Nulla b</li>
        </ul>

        <h2 class="text-lighter">This is a light h2 heading</h2>
        <p class="text-lighter">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam iaculis odio sit amet ligula laoreet semper. Nunc nisl massa, bibendum mattis efficitur id,
          maximus at massa. In mauris justo, aliquam eu hendrerit vel, accumsan vitae metus. Aliquam et enim leo. Morbi ac lacinia erat. Vivamus sagittis, enim eget
          molestie sodales, massa lacus luctus sapien, nec tristique enim nunc a nulla. Donec laoreet viverra est, at maximus felis lacinia in. Fusce gravida, purus
          ac ullamcorper dapibus, dolor lorem viverra neque, et scelerisque elit metus eu urna. Fusce a mi malesuada arcu dignissim condimentum nec eget nisl. Nulla
          blandit mi eu pulvinar facilisis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis justo eu mauris ornare consectetur. Fusce mollis,
          mauris facilisis fermentum finibus, felis justo sagittis enim, a ultrices velit mauris nec orci. Phasellus fermentum commodo enim tincidunt tincidunt.
        </p>

        <h2 class="text-coloured">This is a coloured h2 heading</h2>
        <p class="text-coloured">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam iaculis odio sit amet ligula laoreet semper. Nunc nisl massa, bibendum mattis efficitur id,
          maximus at massa. In mauris justo, aliquam eu hendrerit vel, accumsan vitae metus. Aliquam et enim leo. Morbi ac lacinia erat. Vivamus sagittis, enim eget
          molestie sodales, massa lacus luctus sapien, nec tristique enim nunc a nulla. Donec laoreet viverra est, at maximus felis lacinia in. Fusce gravida, purus
          ac ullamcorper dapibus, dolor lorem viverra neque, et scelerisque elit metus eu urna. Fusce a mi malesuada arcu dignissim condimentum nec eget nisl. Nulla
          blandit mi eu pulvinar facilisis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis justo eu mauris ornare consectetur. Fusce mollis,
          mauris facilisis fermentum finibus, felis justo sagittis enim, a ultrices velit mauris nec orci. Phasellus fermentum commodo enim tincidunt tincidunt.
        </p>

      </b-container>`
  }))
  .add('Buttons', () => ({
    template: `
      <b-container class="mt-3">
        <b-button
          variant="primary"
          class="mr-3"
        >
          Primary Button
        </b-button>

        <b-button
          variant="light"
          :to="localePath({ name: '' })"
          class="mr-3"
        >
          Light Button
        </b-button>

        <b-button
          class="btn-link mr-3"
          variant="link"
        >
          Button Link
        </b-button>

        <b-button
          to=""
          variant="outline-primary text-decoration-none"
        >
          Outlined Primary Button
        </b-button>
      </b-container>
    `
  }))
  .add('Icons', () => ({
    data() {
      return {
        icons: [
          'icon-facebook',
          'icon-twitter',
          'icon-pinterest',
          'icon-instagram',
          'icon-license-pd',
          'icon-license-zero',
          'icon-license-cc',
          'icon-license-by',
          'icon-license-nc',
          'icon-license-sa',
          'icon-license-nd',
          'icon-license-rs-no',
          'icon-license-rs-yes',
          'icon-license-rr',
          'icon-license-rs-unknown',
          'icon-close',
          'icon-caret-down',
          'icon-external-link'
        ]
      };
    },
    template: `
      <b-container class="mt-3">
        <div style="display:flex;flex-wrap: wrap;">
          <div style="background-color:white;width:80px;height:80px;display:flex;justify-content:center;align-items:center" v-for="icon in icons">
            <i :class="icon" :title="icon" />
          </div>
        </div>
      </b-container>
    `
  }));
