import { config } from './';
import { apiError } from './utils';
import { search as searchItems } from './search';

const setApiUrl = (endpoint) => `${config.set.origin}${config.set.path}${endpoint}`;

const setIdFromUri = (uri) => uri.split('/').pop();

export default ($axios) => ({
  search(params) {
    return $axios.get(setApiUrl('/search'), { params });
  },

  /**
   * Get the user's set with type BookmarkFolder
   * @param {string} creator the creator's id
   * @return {String} the id of the set
   */
  getLikes(creator) {
    return this.search({ query: `creator:${creator} type:BookmarkFolder` })
      .then(response => response.data.items ? setIdFromUri(response.data.items[0]) : null)
      .catch(error => {
        throw apiError(error);
      });
  },

  /**
   * Get set by id
   * @param {string} id the set id
   * @param {string} profile the set profile, can be either 'minimal' or 'standard'
   * @return {Object} API response data
   */
  getSet(id, profile) {
    return $axios.get(setApiUrl(`/${id}`), { params: { profile } })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        throw apiError(error);
      });
  },

  /**
   * Get sets for user
   * @param {string} creator the creator's id
   * @param {string} visibility the set's visibility, can be either 'public' or 'private'
   * @param {string} profile the set profile, can be either 'minimal' or 'standard'
   * @return {Array} the ids of the sets
   */
  getSetsByCreator(creator, visibility, profile) {
    const params = { query: `creator:${creator}` };
    if (visibility) params.query = `${params.query} visibility:${visibility}`;
    if (profile) params.profile = profile;

    return this.search(params)
      .then(response => (response.data.items || []).map(setIdFromUri))
      .catch(error => {
        throw apiError(error);
      });
  },

  /**
   * Get all set metadata for the provided set ids
   * @param {Array} ids the ids of sets to retrieve
   * @return {Object[]} an array of sets
   */
  getAllSets(ids) {
    return Promise.all(ids.map(id => $axios.get(setApiUrl(`/${id}`), {
      params: { profile: 'standard' }
    })))
      .then(responseArray => {
        return responseArray.map(set => {
          return {
            id: set.data.id.split('/').pop(),
            title: set.data.title,
            description: set.data.description,
            firstItem: set.data.items ? '/' + set.data.items[0].split('/item/')[1] : null,
            total: set.data.total
          };
        });
      })
      .catch(error => {
        throw apiError(error);
      });
  },

  /**
   * Get a set image for every set containg at least one item from the given set array
   * @param {Object[]} sets the sets for which to retrieve images
   * @return {Object[]} the initial sets with a thumbnail property added for each set that contains at least one item
   */
  getSetImages(sets) {
    const itemQuery = sets.map(e => e.firstItem).filter(Boolean).join('" OR "');
    if (!itemQuery) return sets;

    return searchItems({
      query: `europeana_id:("${itemQuery}")`
    })
      .then(searchResponse => {
        return sets.map(set => {
          const result = searchResponse.results.find(res => res.europeanaId === set.firstItem);
          if (result) set.thumbnail = result.edmPreview;
          return set;
        });
      })
      .catch(error => {
        throw apiError(error);
      });
  },

  /**
   * Create a set of type BookmarkFolder with a fixed title
   * @return {Object} API response data
   */
  createLikes() {
    return $axios.post(setApiUrl('/'),
      {
        type: 'BookmarkFolder',
        title: {
          en: 'LIKES'
        },
        visibility: 'private'
      }
    )
      .then(response => response.data)
      .catch(error => {
        throw apiError(error);
      });
  },

  /**
   * Modify the set items by adding or deleting an item
   * @param {string} action the type of modification, can be either 'add' or 'delete'
   * @param {string} setId the id of the set that will be modified
   * @param {string} itemId the id of the item to be added or deleted
   * @return {Object} API response data
   */
  modifyItems(action, setId, itemId) {
    const apiCall = action === 'add' ? $axios.put : $axios.delete;
    return apiCall(setApiUrl(`/${setId}/${itemId}`))
      .then(response => response.data)
      .catch(error => {
        throw apiError(error);
      });
  }
});
