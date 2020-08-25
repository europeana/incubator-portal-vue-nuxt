export const state = () => ({
  likesId: null,
  likedItems: [],
  active: null
});

export const mutations = {
  setLikesId(state, value) {
    state.likesId = value;
  },
  setLikedItems(state, value) {
    state.likedItems = value;
  },
  like(state, value) {
    state.likedItems.push(value);
  },
  unlike(state, value) {
    state.likedItems.splice(state.likedItems.indexOf(value), 1);
  },
  setActive(state, value) {
    state.active = value;
  }
};

export const getters = {
  isLiked: (state) => (itemId) => {
    return state.likedItems.map(item => item.id).includes(itemId);
  }
};

export const actions = {
  reset({ commit }) {
    commit('setLikesId', null);
    commit('setLikedItems', []);
  },
  async like({ commit, state }, itemId) {
    await this.$sets.modifyItems('add', state.likesId, itemId);
    commit('like', itemId);
  },
  async unlike({ commit, state }, itemId) {
    await this.$sets.modifyItems('delete', state.likesId, itemId);
    commit('unlike', itemId);
  },
  async setLikes({ commit }) {
    const creator = this.$auth.user ? this.$auth.user.sub : null;
    const likesId = await this.$sets.getLikes(creator);

    if (likesId) commit('setLikesId', likesId);
  },
  async createLikes({ commit }) {
    const response = await this.$sets.createLikes();
    commit('setLikesId', response.id);
  },
  async fetchLikes({ commit, state }) {
    if (!state.likesId) return;
    const likes = await this.$sets.getSet(state.likesId, {
      pageSize: 100,
      profile: 'itemDescriptions'
    });
    commit('setLikedItems', likes.items);
  },
  async fetchSet({ commit }, setId) {
    const set = await this.$sets.getSet(setId, {
      profile: 'itemDescriptions'
    });
    commit('setActive', set);
  },
  createSet(ctx, setBody) {
    return this.$sets.createSet(setBody);
  },
  updateSet({ state, commit }, { setId, setBody }) {
    return this.$sets.updateSet(setId, setBody)
      .then(response => {
        if (setId === state.active.id) commit('setActive', { items: state.active.items, ...response });
      });
  },
  deleteSet({ state, commit }, setId) {
    return this.$sets.deleteSet(setId)
      .then(() => {
        if (setId === state.active.id) commit('setActive', null);
      });
  }
};
