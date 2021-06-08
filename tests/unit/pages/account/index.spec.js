import { shallowMountNuxt } from '../../utils';

import page from '../../../../src/pages/account/index';
const factory = () => shallowMountNuxt(page, {
  mocks: {
    $fetchState: {
      pending: false
    },
    $store: {
      state: {
        auth: {
          user: { 'preferred_username': 'tester' }
        },
        set: {
          likedItems: []
        }
      }
    },
    $t: key => key
  }
});

describe('pages/account/index.vue', () => {
  factory();
  it('needs unit tests!');
});
