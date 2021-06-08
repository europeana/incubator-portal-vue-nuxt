import { shallowMountNuxt } from '../../utils';

import page from '../../../../src/pages/account/login';
const factory = () => shallowMountNuxt(page);

describe('pages/account/login.vue', () => {
  factory();
  it('needs unit tests!');
});
