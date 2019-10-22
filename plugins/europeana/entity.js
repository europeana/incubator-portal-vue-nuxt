import { apiError } from './utils';
import axios from 'axios';

/**
 * Get data for one entity from the API
 * @param {string} type the type of the entity, will be normalized to the EntityAPI type if it's a human readable type
 * @param {string} id the id of the entity (can contain trailing slug parts as these will be normalized)
 * @param {Object} params additional parameters sent to the API
 * @param {string} params.wskey API key
 * @return {Object[]} parsed entity data
 */
export function getEntity(type, id, params) {
  return axios.get(getEntityUrl(type, id), {
    params: {
      wskey: params.wskey
    }
  })
    .then((response) => {
      return {
        error: null,
        entity: response.data
      };
    })
    .catch((error) => {
      throw apiError(error);
    });
}

/**
 * Get entity suggestions from the API
 * @param {string} text the query text to supply suggestions for
 * @param {Object} params additional parameters sent to the API
 * @param {string} params.wskey API key
 * @return {Object[]} entity suggestions from the API
 */
export function getEntitySuggestions(text, params) {
  return axios.get('https://api.europeana.eu/entity/suggest', {
    params: {
      text,
      type: 'agent,concept',
      wskey: params.wskey
    }
  })
    .then((response) => {
      return response.data.items ? response.data.items : [];
    })
    .catch((error) => {
      throw apiError(error);
    });
}

/**
 * Retrieve the API name of the type using the human readable name
 * @param {string} type the type of the entity
 * @return {string} retrieved API name of type
 */
function getEntityTypeApi(type) {
  const names = {
    person: 'agent',
    topic: 'concept'
  };
  if (!type) return;
  return names[type];
}

/**
 * Retrieve the human readable of the type using the API name
 * @param {string} type the type of the entity
 * @return {string} retrieved human readable name of type
 */
export function getEntityTypeHumanReadable(type) {
  const names = {
    agent: 'person',
    concept: 'topic'
  };
  if (!type) return;
  return names[type.toLowerCase()];
}

/**
 * Retrieve the URI of the entity from the human readable type and ID
 * @param {string} type the human readable type of the entity either person or topic
 * @param {string} id the numeric identifier of the entity, (can contain trailing slug parts as these will be normalized)
 * @return {string} retrieved human readable name of type
 */
export function getEntityUri(type, id) {
  return `http://data.europeana.eu/${getEntityTypeApi(type)}/base/${normalizeEntityId(id)}`;
}

/**
 * Construct an entity-type-specific Record API query for an entity
 * @param {string} uri entity URI
 * @return {string} Record API query
 */
export function getEntityQuery(uri) {
  if (uri.includes('/concept/base/')) {
    return `skos_concept:"${uri}"`;
  } else if (uri.includes('/agent/base/')) {
    return `edm_agent:"${uri}"`;
  }
  return null;
}

/**
 * Retrieve the URL of the entity from the human readable type and ID
 * @param {string} type the human readable type of the entity either person or topic
 * @param {string} id the numeric identifier of the entity, (can contain trailing slug parts as these will be normalized)
 * @return {string} retrieved human readable name of type
 */
function getEntityUrl(type, id) {
  return `https://api.europeana.eu/entity/${getEntityTypeApi(type)}/base/${normalizeEntityId(id)}.json`;
}

/**
 * Remove any additional data from the slug in order to retrieve the entity id.
 * @param {string} id the id of the entity
 * @return {string} retrieved id
 */
function normalizeEntityId(id) {
  if (!id) return;
  return id.split('-')[0];
}

/**
 * Retrieves the path for the entity, based on id and title
 * @param {Object} entity an entity object as retrieved from the entity API
 * @param {string} title the title of the entity
 * @return {string} path
 */
export function getEntitySlug(entity) {
  const entityId = entity.id.toString().split('/').pop();
  const path = entityId + (entity.prefLabel.en ? '-' + entity.prefLabel.en.toLowerCase().replace(/ /g, '-') : '');
  return path;
}

/**
 * Search for specific facets for this entity to find the related entities
 * @param {string} type the type of the entity
 * @param {string} id the id of the entity, (can contain trailing slug parts as these will be normalized)
 * @param {Object} params additional parameters sent to the API
 * @return {Object} related entities
 * TODO: add people as related entities again
 */
export function relatedEntities(type, id, params) {
  const entityUri = getEntityUri(type, id);
  let apiParams = {
    wskey: params.wskey,
    profile: 'facets',
    facet: 'skos_concept',
    query: getEntityQuery(entityUri),
    rows: 0
  };

  return axios.get('https://api.europeana.eu/api/v2/search.json', {
    params: apiParams
  })
    .then((response) => {
      return response.data.facets ? getEntityFacets(response.data.facets, normalizeEntityId(id), params.entityKey) : [];
    })
    .catch((error) => {
      const message = error.response ? error.response.data.error : error.message;
      throw new Error(message);
    });
}

/**
 * Return the facets that include data.europeana.eu
 * @param {Object} facets the facets retrieved from the search
 * @param {String} currentId id of the current entity
 * @param {String} entityKey the key for the entity api
 * @return {Object} related entities
 * TODO: limit results
 */
function getEntityFacets(facets, currentId, entityKey) {
  let entities = [];
  for (let facet of facets) {
    entities = entities.concat(facet['fields'].filter(value =>
      value['label'].includes('http://data.europeana.eu') && value['label'].split('/').pop() !== currentId
    ));
  }
  return getDataForEntities(entities, entityKey);
}

/**
 * Lookup data for the given list of entity URIs
 * @param {Object} entities the entities retrieved from the facet search
 * @param {String} entityKey the key for the entity api
 * @return {Object} looked up entities data
 */
function getDataForEntities(entities, entityKey) {
  if (entities.length === 0) return;

  const entityLabels = entities.slice(0,4).map(entity => {
    return entity['label'];
  });

  const q = entityLabels.join('" OR "');
  return axios.get('https://api.europeana.eu/entity/search', {
    params: {
      query: `entity_uri:("${q}")`,
      wskey: entityKey
    }
  })
    .then((response) => {
      let items = response.data.items ? response.data.items : [];
      return getRelatedEntityTitleLink(items);
    })
    .catch((error) => {
      const message = error.response ? error.response.data.error : error.message;
      throw new Error(message);
    });
}

/**
 * Format the the entity data
 * @param {Object} entities the lookuped data for entities
 * @return {Object} entity links and titles
 */
function getRelatedEntityTitleLink(entities) {
  let entityDetails = [];

  for (let entity of entities) {
    if (entity.prefLabel.en) {
      entityDetails.push({
        type: getEntityTypeHumanReadable(entity.type),
        path: getEntitySlug(entity),
        title: entity.prefLabel.en
      });
    }
  }
  return entityDetails;
}

/**
 * Get the description for the entity
 * If type is topic, use note
 * If type is person, use biographicalInformation
 * @param {Object} entity data
 * @return {String} description when available in English
 */
export function getEntityDescription(entity) {
  let description;
  if (entity.type === 'Concept' && entity.note) {
    description = entity.note.en ? entity.note.en[0] : '';
  } else if (entity.type === 'Agent' && entity.biographicalInformation) {
    // check if biographicalInformation is an array of objects
    // TODO: it _should_ always be an array. this is an Entity API bug. remove
    //       the condition when fixed upstream.
    //       see: https://europeana.atlassian.net/browse/EA-1685
    if (entity.biographicalInformation.length !== undefined) {
      description = entity.biographicalInformation.filter(info => info['@language'] === 'en')[0]['@value'];
    } else {
      description = entity.biographicalInformation['@language'] === 'en' ? entity.biographicalInformation['@value'] : '';
    }
  }
  return description;
}

/**
 * The logic for going from: http://commons.wikimedia.org/wiki/Special:FilePath/[image] to
 * https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/[image]/200px-[image]:
 * @image {String} image url
 * @return {String} formatted thumbnail url
 */
export function getWikimediaThumbnailUrl(image) {
  const md5 = require('md5');

  const filename = image.split('/').pop();
  const suffix = filename.endsWith('.svg') ? '.png' : '';
  const underscoredFilename = decodeURIComponent(filename).replace(/ /g, '_');
  const hash = md5(underscoredFilename);

  return 'https://upload.wikimedia.org/wikipedia/commons/thumb/' +
      hash.substring(0, 1) + '/' + hash.substring(0, 2) + '/' +
      underscoredFilename + '/255px-' + underscoredFilename + suffix;
}
