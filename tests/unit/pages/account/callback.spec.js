import { shallowMountNuxt } from '../../utils';

import page from '../../../../src/pages/account/callback';
const factory = () => shallowMountNuxt(page);

describe('pages/account/callback.vue', () => {
  factory();
  it('needs unit tests!');
});
