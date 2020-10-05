export const state = () => ({
  curatedEntities: null
});

export const mutations = {
  setCuratedEntities(state, value) {
    state.curatedEntities = value;
  }
};

export const getters = {
  curatedEntity: (state) => (uri) => {
    return state.curatedEntities.find(entity => entity.identifier === uri);
  }
};
