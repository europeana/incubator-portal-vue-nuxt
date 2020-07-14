import europeanaPlugin from '../plugins/europeana';

export const actions = {
  // WARNING: Do not make API calls here without **very** good reason, such as
  //          there being no feasible alternative... which is unlikely. Those
  //          requests will be made on **every** SSR, even those interrupted
  //          by middleware, such as those resulting in redirects and never using
  //          the response of the API calls.
  async nuxtServerInit(store, context) {
    store.commit('config/set', process.env);

    console.log('config.settings', store.state.config.settings);

    store.dispatch('http/init', context);
    // TODO: does this warrant a store module, or should we just write to context.app here?
    store.commit('apis/setOrigin', store.getters['http/origin']);
    europeanaPlugin({ store });
  }
};
