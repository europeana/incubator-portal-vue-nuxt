import { init as initApm } from '@elastic/apm-rum';

import options from './options';

export default () => {
  initApm(options);
};
