export const actions = {
  // WARNING: Do not make API calls here without **very** good reason, such as
  //          there being no feasible alternative... which is unlikely. Those
  //          requests will be made on **every** SSR, even those interrupted
  //          by middleware, such as those resulting in redirects and never using
  //          the response of the API calls.
  async nuxtServerInit(store, context) {
    store.dispatch('http/init', context);
    store.dispatch('apis/serverInit', context);
    // TODO: does this warrant a store module, or should we just write to context.app here?
    store.commit('apis/setOrigin', store.getters['http/origin']);
  }
};
