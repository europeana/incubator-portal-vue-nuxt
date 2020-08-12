import axios from 'axios';
import { apiError, langMapValueForLocale } from './utils';
import { config } from './';

/**
 * Get data for one entity from the API
 * @param {string} type the type of the entity, will be normalized to the EntityAPI type if it's a human readable type
 * @param {string} id the id of the entity (can contain trailing slug parts as these will be normalized)
 * @return {Object[]} parsed entity data
 */
export function getEntity(type, id) {
  return axios.get(getEntityUrl(type, id), {
    params: {
      wskey: config.entity.key
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

function entityApiUrl(endpoint) {
  return `${config.entity.origin}${config.entity.path}${endpoint}`;
}

/**
 * Get entity suggestions from the API
 * @param {string} text the query text to supply suggestions for
 * @param {Object} params additional parameters sent to the API
 * @param {string} params.language language(s), comma-separated, to request
 */
export function getEntitySuggestions(text, params = {}) {
  return axios.get(entityApiUrl('/suggest'), {
    params: {
      ...params,
      text,
      type: 'agent,concept',
      scope: 'europeana',
      wskey: config.entity.key
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
export function getEntityTypeApi(type) {
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
  return `${config.data.origin}/${getEntityTypeApi(type)}/base/${normalizeEntityId(id)}`;
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
  return entityApiUrl(`/${getEntityTypeApi(type)}/base/${normalizeEntityId(id)}.json`);
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
 *
 * If `entityPage.name` is present, that will be used in the slug. Otherwise
 * `prefLabel.en` if present.
 *
 * @param {string} id entity ID, i.e. data.europeana.eu URI
 * @param {string} name the English name of the entity
 * @return {string} path
 * @example
 *    const slug = getEntitySlug(
 *      'http://data.europeana.eu/concept/base/48',
 *      'Photography'
 *    );
 *    console.log(slug); // expected output: '48-photography'
 * @example
 *    const slug = getEntitySlug(
 *      'http://data.europeana.eu/agent/base/59832',
 *      'Vincent van Gogh'
 *    );
 *    console.log(slug); // expected output: '59832-vincent-van-gogh'
 */
export function getEntitySlug(id, name) {
  const entityId = id.toString().split('/').pop();
  const path = entityId + (name ? '-' + name.toLowerCase().replace(/ /g, '-') : '');
  return path;
}

/**
 * Search for specific facets for this entity to find the related entities
 * @param {string} type the type of the entity
 * @param {string} id the id of the entity, (can contain trailing slug parts as these will be normalized)
 * @return {Object} related entities
 * TODO: add people as related entities again
 * TODO: use search() function?
 */
export function relatedEntities(type, id, options = {}) {
  const origin = options.origin || config.record.origin;
  const path = options.path || config.record.path;

  const entityUri = getEntityUri(type, id);
  let apiParams = {
    wskey: config.record.key,
    profile: 'facets',
    facet: 'skos_concept',
    query: getEntityQuery(entityUri),
    rows: 0
  };

  return axios.get(`${origin}${path}/search.json`, {
    params: apiParams
  })
    .then((response) => {
      return response.data.facets ? getEntityFacets(response.data.facets, normalizeEntityId(id)) : [];
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
 * @return {Object} related entities
 * TODO: limit results
 */
async function getEntityFacets(facets, currentId) {
  let entities = [];
  for (const facet of facets) {
    const facetFilter = (value) => value['label'].includes(config.data.origin) && value['label'].split('/').pop() !== currentId;
    entities = entities.concat(facet['fields'].filter(facetFilter));
  }

  const entityUris = entities.slice(0, 4).map(entity => {
    return entity['label'];
  });
  return getRelatedEntityData(await findEntities(entityUris));
}

/**
 * Lookup data for the given list of entity URIs
 * @param {Array} entityUris the URIs of the entities to retrieve
 * @return {Object} entity data
 */
export function findEntities(entityUris) {
  if (entityUris.length === 0) return;
  const q = entityUris.join('" OR "');
  const params = {
    query: `entity_uri:("${q}")`
  };
  return searchEntities(params)
    .then((response) => {
      return response.entities || [];
    });
}

/**
 * Format the the entity data for a related entity
 * @param {Object} entities the data returned from the Entity API
 * @return {Object[]} entity data
 */
function getRelatedEntityData(entities) {
  let entityDetails = [];
  for (let entity of entities || []) {
    if (entity.prefLabel.en) {
      entityDetails.push(entity);
    }
  }
  return entityDetails;
}

/**
 * Get the description for the entity
 * If type is topic, use note
 * If type is person, use biographicalInformation
 * @param {Object} entity data
 * @param {string} locale Locale code for desired language
 * @return {String} description when available in English
 * TODO: l10n
 */
export function getEntityDescription(entity, locale) {
  if (!entity) return null;
  let description;
  if (entity.type === 'Concept' && entity.note) {
    description = langMapValueForLocale(entity.note, locale);
  } else if (entity.type === 'Agent' && entity.biographicalInformation) {
    // check if biographicalInformation is an array of objects
    // TODO: it _should_ always be an array. this is an Entity API bug. remove
    //       the condition when fixed upstream.
    //       see: https://europeana.atlassian.net/browse/EA-1685
    if (entity.biographicalInformation.length === undefined) {
      const text = entity.biographicalInformation['@language'] === 'en' ? entity.biographicalInformation['@value'] : '';
      description = { values: [text], code: 'en' };
    } else {
      description = langMapValueForLocale(entity.biographicalInformation, locale);
    }
  }
  return description;
}

/**
 * A check for a URI to see if it conforms ot the entity URI pattern,
 * optionally takes entity types as an array of values to check for.
 * Will return true/false
 * @param {string} uri A URI to check
 * @param {string[]} types the entity types to check, defaults to all.
 * @return {Boolean} true if the URI is a valid entity URI
 */
export function isEntityUri(uri, types) {
  types = types ? types : ['concept', 'agent', 'place'];
  return RegExp(`^http://data\\.europeana\\.eu/(${types.join('|')})/base/\\d+$`).test(uri);
}

/**
 * From a URI split params as required by the portal
 * @param {string} uri A URI to check
 * @return {{type: String, identifier: string}} Object with the portal relevant identifiers.
 */
export function entityParamsFromUri(uri) {
  const matched = uri.match(/^http:\/\/data\.europeana\.eu\/(concept|agent|place)\/base\/(\d+)$/);
  const id = matched[2];
  const type = getEntityTypeHumanReadable(matched[1]);
  return { id, type };
}

/**
 * Return all entity subjects of type concept / agent
 * @param {Object} params additional parameters sent to the API
 */
export function searchEntities(params = {}) {
  return axios.get(entityApiUrl('/search'), {
    params: {
      ...params,
      wskey: config.entity.key
    }
  })
    .then((response) => {
      return {
        entities: response.data.items ? response.data.items : [],
        total: response.data.partOf ? response.data.partOf.total : null
      };
    })
    .catch((error) => {
      throw apiError(error);
    });
}
