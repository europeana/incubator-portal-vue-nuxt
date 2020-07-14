import { createLocalVue, shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';

import BlogAuthors from '../../../../components/blog/BlogAuthors.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const factory = () => shallowMount(BlogAuthors, {
  localVue,
  mocks: {
    $t: (key) => key
  }
});

describe('components/blog/BlogAuthors', () => {
  it('displays `Author` if there is only one author', () => {
    const wrapper = factory();

    wrapper.setProps({
      authors: [
        {
          fields: {
            name: 'Joe bloggs'
          }
        }
      ]
    });

    wrapper.vm.authorTitle.should.eq('blog.author');
  });

  it('displays `Author` if there is only one author', () => {
    const wrapper = factory();

    wrapper.setProps({
      authors: [
        {
          fields: {
            name: 'Joe bloggs'
          }
        },
        {
          fields: {
            name: 'Jane bloggs'
          }
        }
      ]
    });

    wrapper.vm.authorTitle.should.eq('blog.authors');
  });
});
