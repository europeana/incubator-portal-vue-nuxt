import axios from 'axios';
import escapeRegExp from 'lodash/escapeRegExp';
import omitBy from 'lodash/omitBy';
import uniq from 'lodash/uniq';
import merge from 'deepmerge';

import { apiError } from './utils';
import { config } from './';
import { thumbnailUrl, thumbnailTypeForMimeType } from  './thumbnail';
import { combineMerge } from '../utils';

/**
 * Parse the record data based on the data from the API response
 * @param {Object} response data from API response
 * @return {Object} parsed data
 */
function parseRecordDataFromApiResponse(response) {
  const edm = response.data.object;

  const providerAggregation = edm.aggregations[0];
  const entities = [].concat(edm.concepts, edm.places, edm.agents, edm.timespans)
    .filter(isNotUndefined)
    .reduce((memo, entity) => {
      memo[entity.about] = entity;
      return memo;
    }, {});
  const proxyData = merge.all(edm.proxies, { arrayMerge: combineMerge });

  return {
    altTitle: proxyData.dctermsAlternative,
    description: proxyData.dcDescription,
    identifier: edm.about,
    type: edm.type,
    isShownAt: providerAggregation.edmIsShownAt,
    coreFields: coreFields(proxyData, providerAggregation.edmDataProvider, entities),
    fields: extraFields(proxyData, edm, entities),
    media: aggregationMedia(providerAggregation, edm.type, edm.services),
    agents: edm.agents,
    concepts: edm.concepts,
    title: proxyData.dcTitle
  };
}

/**
 * Retrieves the "Core" fields which will always be displayed on record pages.
 *
 * @param {Object} proxyData All core fields are in the proxyData.
 * @param {Object[]} entities Entities in order to perform entity lookups
 * @return {Object} Key value pairs of the metadata fields.
 */
function coreFields(proxyData, edmDataProvider, entities) {
  return lookupEntities(omitBy({
    edmDataProvider,

    dcContributor: proxyData.dcContributor,
    dcCreator: proxyData.dcCreator,
    dcPublisher: proxyData.dcPublisher,
    dcSubject: proxyData.dcSubject,
    dcType: proxyData.dcType,
    dctermsMedium: proxyData.dctermsMedium
  }, isUndefined), entities);
}

/**
 * Retrieves all additional fields which will be displayed on record pages in the collapsable section.
 *
 * @param {Object} proxyData To take the fields from.
 * @param {Object} edm To take additional fields from.
 * @param {Object[]} entities Entities in order to perform entity lookups
 * @return {Object} Key value pairs of the metadata fields.
 */
function extraFields(proxyData, edm, entities) {
  const providerAggregation = edm.aggregations[0];
  const europeanaAggregation = edm.europeanaAggregation;
  return lookupEntities(omitBy({
    edmProvider: providerAggregation.edmProvider,
    edmIntermediateProvider: providerAggregation.edmIntermediateProvider,
    edmCountry: europeanaAggregation.edmCountry,
    edmRights: providerAggregation.edmRights,
    dcRights: proxyData.dcRights,
    dcPublisher: proxyData.dcPublisher,
    dctermsCreated: proxyData.dctermsCreated,
    dcDate: proxyData.dcDate,
    dctermsIssued: proxyData.dctermsIssued,
    dctermsPublished: proxyData.dctermsPublished,
    dctermsTemporal: proxyData.dctermsTemporal,
    dcCoverage: proxyData.dcCoverage,
    dctermsSpatial: proxyData.dctermsSpatial,
    edmCurrentLocation: proxyData.edmCurrentLocation,
    edmUgc: providerAggregation.edmUgc,
    dctermsProvenance: proxyData.dctermsProvenance,
    dcSource: proxyData.dcSource,
    dcIdentifier: proxyData.dcIdentifier,
    europeanaCollectionName: edm.europeanaCollectionName,
    timestampCreated: edm.timestamp_created,
    timestampUpdate: edm.timestamp_update,
    dctermsExtent: proxyData.dctermsExtent,
    dcDuration: proxyData.dcDuration,
    dcMedium: proxyData.dcMedium,
    dcFormat: proxyData.dcFormat,
    dcLanguage: proxyData.dcLanguage,
    dctermsIsPartOf: proxyData.dctermsIsPartOf,
    dcRelation: proxyData.dcRelation,
    dctermsReferences: proxyData.dctermsReferences,
    dctermsHasPart: proxyData.dctermsHasPart,
    dctermsHasVersion: proxyData.dctermsHasVersion,
    dctermsIsFormatOf: proxyData.dctermsIsFormatOf,
    dctermsIsReferencedBy: proxyData.dctermsIsReferencedBy,
    dctermsIsReplacedBy: proxyData.dctermsIsReplacedBy,
    dctermsIsRequiredBy: proxyData.dctermsIsRequiredBy,
    edmHasMet: proxyData.edmHasMet,
    edmIncorporates: proxyData.edmIncorporates,
    edmIsDerivativeOf: proxyData.edmIsDerivativeOf,
    edmIsRepresentationOf: proxyData.edmIsRepresentationOf,
    edmIsSimilarTo: proxyData.edmIsSimilarTo,
    edmIsSuccessorOf: proxyData.edmIsSuccessorOf,
    edmRealizes: proxyData.edmRealizes,
    wasPresentAt: proxyData.wasPresentAt
  }, isUndefined), entities);
}

function aggregationMedia(aggregation, recordType, services = []) {
  // Gather all isShownBy/At and hasView URIs
  const edmIsShownByOrAt = aggregation.edmIsShownBy || aggregation.edmIsShownAt;
  const mediaUris = uniq([edmIsShownByOrAt].concat(aggregation.hasView || []).filter(isNotUndefined));

  // Filter web resources to isShownBy and hasView, respecting the ordering
  const media = mediaUris.map((mediaUri) => aggregation.webResources.find((webResource) => mediaUri === webResource.about));

  for (const webResource of media) {
    // Inject thumbnail URLs
    webResource.thumbnails = webResourceThumbnails(webResource, aggregation, recordType);

    // Inject service definitions, e.g. for IIIF
    webResource.services = services.filter((service) => (webResource.svcsHasService || []).includes(service.about));
  }

  // Sort by isNextInSequence property if present
  return sortByIsNextInSequence(media);
}

function webResourceThumbnails(webResource, aggregation, recordType) {
  const type = thumbnailTypeForMimeType(webResource.ebucoreHasMimeType) || recordType;

  let uri = webResource.about;
  if (aggregation.edmObject && ([aggregation.edmIsShownBy, aggregation.edmIsShownAt].includes(uri))) {
    uri = aggregation.edmObject;
  }

  return {
    small: thumbnailUrl(uri, {
      size: 'w200',
      type
    }),
    large: thumbnailUrl(uri, {
      size: 'w400',
      type
    })
  };
}

/**
 * Sorts an array of objects by the `isNextInSequence` property.
 *
 * Logic:
 * * Any objects not having `isNextInSequence` will not be moved.
 * * Any objects having `isNextInSequence` will be moved to the position
 *   immediately following the other object whose `about` property matches this
 *   one's `isNextInSequence`
 *
 * @param {Object[]} source items to sort
 * @return {Object[]} sorted items
 * @example
 *    const unsorted = [
 *      { about: 'd', isNextInSequence: 'c' },
 *      { about: 'b', isNextInSequence: 'a' },
 *      { about: 'a' },
 *      { about: 'c', isNextInSequence: 'b' }
 *    ];
 *    const sorted = sortByIsNextInSequence(unsorted);
 *    console.log(sorted[0].about); // expected output: 'a'
 *    console.log(sorted[1].about); // expected output: 'b'
 *    console.log(sorted[2].about); // expected output: 'c'
 *    console.log(sorted[3].about); // expected output: 'd'
 */
function sortByIsNextInSequence(source) {
  // Make a copy to work on
  const items = [].concat(source);

  const itemUris = items.map((item) => item.about);

  for (const uri of itemUris) {
    // It's necessary to find the item on each iteration to sort as it may have
    // been moved from its original position by a previous iteration.
    const sortItemIndex = items.findIndex((item) => item.about === uri);
    const sortItem = items[sortItemIndex];

    // If it has isNextInSequence property, move it after that item; else
    // leave it be.
    if (sortItem.isNextInSequence) {
      const isPreviousInSequenceIndex = items.findIndex((item) => item.about === sortItem.isNextInSequence);
      if (isPreviousInSequenceIndex !== -1) {
        // Remove the item from its original position.
        items.splice(sortItemIndex, 1);
        // Insert the item after its predecessor.
        items.splice(isPreviousInSequenceIndex + 1, 0, sortItem);
      }
    }
  }

  return items;
}

function isUndefined(value) {
  return value === undefined;
}
function isNotUndefined(value) {
  return !isUndefined(value);
}

/**
 * Update a set of fields, in order to find linked entity data.
 * will match any literal values in  the 'def' key to about fields
 * in any of the entities and return the related object instead of
 * the plain string.
 * @param fields Object representing the metadata fields
 * @param entities key(URI) value(JSON object) map of entity objects for this record
 * @return {Object[]} The fields with any entities as JSON objects
 */
function lookupEntities(fields, entities) {
  for (const key in fields) {
    setMatchingEntities(fields, key, entities);
  }
  return fields;
}

function setMatchingEntities(fields, key, entities) {
  // Only looks for entities in 'def'
  for (const [index, value] of (fields[key]['def'] || []).entries()) {
    if (entities[value]) {
      fields[key]['def'][index] = entities[value];
    }
  }
}

/**
 * Get the record data from the API
 * @param {string} europeanaId ID of Europeana record
 * @return {Object} parsed record data
 */
export function getRecord(europeanaId, options = {}) {
  const origin = options.origin || config.record.origin;
  let path = options.path || config.record.path;
  if (!path.endsWith('/record')) path += '/record';

  return axios.get(`${origin}${path}${europeanaId}.json`, {
    params: {
      wskey: config.record.key
    }
  })
    .then((response) => {
      return {
        record: parseRecordDataFromApiResponse(response),
        error: null
      };
    })
    .catch((error) => {
      throw apiError(error);
    });
}

/**
 * Tests whether a string is a valid Europeana record ID.
 * @param {string} value Value to test
 * @return {Boolean}
 */
export function isEuropeanaRecordId(value) {
  return /^\/[0-9]+\/[a-zA-Z0-9_]+$/.test(value);
}

// Configuration for constructing similar items queries
const SIMILAR_ITEMS_FIELDS = new Map([
  ['what', { data: ['dcSubject', 'dcType'], boost: 0.8 }],
  ['who', { data: ['dcCreator'], boost: 0.5 } ],
  ['DATA_PROVIDER', { data: ['edmDataProvider'], boost: 0.2 } ]
]);

/**
 * Construct Record API similar items query
 * @param {string} about Europeana identifier of the current item
 * @param {Object} [data={}] Current item data
 * @return {string} Query to send to the Record API
 */
export function similarItemsQuery(about, data = {}) {
  const queryTerms = new Map;

  // Map the terms from item data onto their respective similar items query fields
  for (const [queryField, queryFieldOptions] of SIMILAR_ITEMS_FIELDS) {
    for (const dataField of queryFieldOptions.data) {
      if (data[dataField]) {
        queryTerms.set(queryField, (queryTerms.get(queryField) || []).concat(data[dataField]));
        if (queryTerms.get(queryField).length === 0) queryTerms.delete(queryField);
      }
    }
  }

  // Construct one fielded and boosted query of potentially multiple terms
  const fieldQueries = [];
  for (const [queryField, queryFieldTerms] of queryTerms) {
    const boost = SIMILAR_ITEMS_FIELDS.get(queryField).boost;
    const fieldQuery = `${queryField}:(` + queryFieldTerms.map((term) => {
      return '"' + escapeLuceneSpecials(term) + '"';
    }).join(' OR ') + `)^${boost}`;
    fieldQueries.push(fieldQuery);
  }

  // No queries, no query
  if (fieldQueries.length === 0) return null;

  // Combine fielded queries, and exclude the current item
  const query = '(' + fieldQueries.join(' OR ') + `) NOT europeana_id:"${about}"`;
  return query;
}

/**
 * Escapes Lucene syntax special characters
 * For instance, so that a string may be used in a Record API search query.
 * @param {string} unescaped Unescaped string
 * @return {string} Escaped string
 */
function escapeLuceneSpecials(unescaped) {
  const specials = ['\\', '+', '-', '&', '|', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '/'];

  return specials.reduce((memo, special) => {
    memo = memo.replace(new RegExp(escapeRegExp(special), 'g'), `\\${special}`);
    return memo;
  }, unescaped);
}
