// Fails with `TypeError: Expected parameter accessToken` from the contentful
// npm package.
// It seems process.env does not include the contents of the .env file, despite
// vue-test-utils using vue-cli-service and this: https://cli.vuejs.org/guide/mode-and-env.html
// TODO: figure out why, resolve, and complete unit tests

// import { createLocalVue, shallowMount } from '@vue/test-utils';
// import BootstrapVue from 'bootstrap-vue';

// import LatestSection from '../../../../components/browse/LatestSection.vue';

// const localVue = createLocalVue();
// localVue.use(BootstrapVue);

// const factory = () => shallowMount(LatestSection, {
//  localVue,
//  mocks: {
//    $t: () => {},
//    createClient: () => {}
//  }
// });

// describe('components/browse/LatestSection', () => {
//  it('shows bold text', () => {
//    const wrapper = factory();
//    wrapper.setProps({ category: 'Exhibitions' });

//    wrapper.find('[data-qa="latest Exhibitions"]').exists().should.be.true;
//  });
// });
