import remove from 'lodash/remove';

export function apiError(error) {
  let statusCode = 500;
  let message = error.message;

  if (error.response) {
    statusCode = error.response.status;
    message = error.response.data.error;
  }

  const apiError = new Error(message);
  apiError.statusCode = statusCode;
  return apiError;
}

const locales = require('../i18n/locales.js');
const undefinedLocaleCodes = ['def', 'und'];
const uriRegex = /^https?:\/\//; // Used to determine if a value is a URI

const isoAlpha3Map = locales.reduce((memo, locale) => {
  memo[locale.isoAlpha3] = locale.code;
  return memo;
}, {});
isoAlpha3Map['def'] = '';
isoAlpha3Map['und'] = '';

const languageKeyMap = locales.reduce((memo, locale) => {
  memo[locale.code] = [locale.code, locale.isoAlpha3, locale.iso];
  return memo;
}, {});

const languageKeysWithFallbacks = locales.reduce((memo, locale) => {
  memo[locale.code] = languageKeyMap[locale.code] || [];

  if (locale.code !== 'en') {
    // Add English locale keys as fallbacks for other languages
    memo[locale.code] = memo[locale.code].concat(languageKeyMap.en);
  }

  memo[locale.code] = memo[locale.code].concat(undefinedLocaleCodes); // Also fallback to "undefined" language literals

  return memo;
}, {});

function isEntity(value) {
  return value && value.about;
}

// function entityValues(values, locale) {
//   const iterableValues = ((typeof(values) === 'string') ? [values] : values || []);
//   const iterableEntities = iterableValues.filter((value) => isEntity(value));
//   return iterableEntities.map((value) => entityValue(value, locale));
// }

// function entityValue(value, locale) {
//   if (value.prefLabel) {
//     let entityValue = langMapValueForLocale(value.prefLabel, locale);
//     if (entityValue.values.length === 0) entityValue = { code: '', values: [value.about] };
//     entityValue.about = value.about;
//     return entityValue;
//   }
//   return { code: '', values: [value.about], about: value.about };
// }

function languageKeys(locale, lastResort) {
  const localeFallbackKeys = undefinedLocaleCodes.concat(languageKeyMap.en);
  const keys = languageKeysWithFallbacks[locale] || localeFallbackKeys;
  if (lastResort && !keys.includes(lastResort)) keys.push(lastResort);
  return keys;
}

/**
 * Get the localised value for the current locale, with preferred fallbacks.
 * Will return the first value if no value was found in any of the preferred locales.
 * Will favour non URI values even in non preferred languages if otherwise only URI(s) would be returned.
 * With the setting omitUrisIfOtherValues set to true URI values will be removed if any plain text value is available.
 * With the setting omitAllUris set to true, when no other values were found all values matching the URI pattern will be
 * omitted.
 * @param {Object} The LangMap
 * @param {String} locale Current locale as a 2 letter code
 * @param {Boolean} options.omitUrisIfOtherValues Setting to prefer any value over URIs
 * @param {Boolean} options.omitAllUris Setting to remove all URIs
 * @return {{Object[]{language: String, values: Object[]}}} Language code and values, values may be strings or language maps themselves.
 */
export function langMapValueForLocale(langMap, locale, options = {}) {
  if (typeof langMap === 'string') {
    return [{ lang: '', value: langMap }];
  } else if (Array.isArray(langMap)) {
    return langMap.map(value => {
      return { lang: '', value };
    });
  } else if (!langMap) {
    return null;
  }
  console.log('langMapValueForLocale langMap (IN)', JSON.stringify(langMap, 2, null));
  // const localisedLangMap = { values: [] };

  spreadEntitiesOverLangMap(langMap);

  const keys = languageKeys(locale, Object.keys(langMap)[0]);
  const localisedLangMap = [];
  for (const key of keys) {
    if (langMap[key]) {
      const lang = normalizedLangCode(key);
      const value = [].concat(langMap[key]);
      localisedLangMap.push({ lang, value });
    }
  }

  // for (const key of ) { // loop through all language key to find a match
  //   setLangMapValuesAndCode(localisedLangMap, langMap, key, locale);
  //   // if (localisedLangMap.values.length >= 1) break;
  // }

  // No preferred language found, so just add the first
  // if (localisedLangMap.values.length === 0) {
  //   setLangMapValuesAndCode(localisedLangMap, langMap, Object.keys(langMap)[0], locale);
  // }

  // addEntityValues(localisedLangMap, entityValues(langMap['def'], locale));

  // In case an entity resolves as only its URI as is the case in search responses on the  minimal profile
  // as no linked entity data is returned so the prefLabel can't be retrieved.
  // if (onlyUriValues(withEntities.values) && localisedLangMap.code === '' && hasNonDefValues(langMap)) {
  //   withEntities = localisedLangMapFromFirstNonDefValue(langMap);
  // }
  if (options.omitAllUris) omitAllUris(localisedLangMap);
  if (options.omitUrisIfOtherValues) omitUrisIfOtherValues(localisedLangMap);
  omitBlankValues(localisedLangMap);

  const flattened = flattenLangMap(localisedLangMap[0]) || null;
  console.log('langMapValueForLocale langMap (OUT)', JSON.stringify(flattened, 2, null));
  return flattened;
}

function spreadEntitiesOverLangMap(langMap) {
  console.log('spreadEntitiesOverLangMap langMap (IN)', JSON.stringify(langMap, 2, null));

  let entities = [];

  for (const key in langMap) {
    entities = entities.concat(remove(langMap[key], isEntity));
  }

  for (const entity of entities) {
    for (const prefLabelKey in entity.prefLabel) {
      if (!langMap[prefLabelKey]) langMap[prefLabelKey] = [];
      for (const prefLabelValue of entity.prefLabel[prefLabelKey]) {
        langMap[prefLabelKey].push({ about: entity.about, value: prefLabelValue });
      }
    }
  }

  console.log('spreadEntitiesOverLangMap langMap (OUT)', JSON.stringify(langMap, 2, null));
}

function flattenLangMap(localisedLangMap) {
  return !localisedLangMap ? null : localisedLangMap.value.map((value) => {
    return { lang: localisedLangMap.lang, value };
  });
}

function omitUrisIfOtherValues(localisedLangMap) {
  for (const candidate of localisedLangMap) {
    if (candidate.value.some((value) => !uriRegex.test(value))) {
      remove(candidate.value, (value) => uriRegex.test(value));
    }
  }
}

function omitAllUris(localisedLangMap) {
  for (const candidate of localisedLangMap) {
    remove(candidate.value, (value) => uriRegex.test(value));
  }
}

function omitBlankValues(localisedLangMap) {
  remove(localisedLangMap, (candidate) => candidate.value.length === 0);
}

// function localisedLangMapFromFirstNonDefValue(langMap) {
//   for (let key in langMap) {
//     if (key !== 'def') {
//       return { values: langMap[key], code: key };
//     }
//   }
// }
//
// function hasNonDefValues(langMap) {
//   const keys = Object.keys(langMap);
//   return  keys.some((key) => {
//     return key !== 'def';
//   });
// }
//
// // check if values are exclusively URIs.
// function onlyUriValues(values) {
//   return values.every((value) => uriRegex.test(value));
// }

// function isJSONLDExpanded(values) {
//   return values[0] && Object.prototype.hasOwnProperty.call(values[0], '@language');
// }
//
// function langMapValueFromJSONLD(value, locale) {
//   const forCurrentLang = value.find(element => element['@language'] === locale);
//   return forCurrentLang && forCurrentLang['@value'];
// }

// function setLangMapValuesAndCode(returnValue, langMap, key, locale) {
//   if (langMap[key]) {
//     langMapValueAndCodeFromMap(returnValue, langMap, key, locale);
//   } else if (isJSONLDExpanded(langMap)) {
//     langMapValueAndCodeFromJSONLD(returnValue, langMap, key, locale);
//   }
// }

// function langMapValueAndCodeFromMap(returnValue, langMap, key, locale) {
//   setLangMapValues(returnValue, langMap, key, locale);
//   setLangCode(returnValue, key, locale);
//   if (undefinedLocaleCodes.includes(key)) filterEntities(returnValue);
// }
//
// function langMapValueAndCodeFromJSONLD(returnValue, langMap, key, locale) {
//   const matchedValue = langMapValueFromJSONLD(langMap, key);
//   if (matchedValue) returnValue.values = [matchedValue];
//   setLangCode(returnValue, key, locale);
// }
//
// function addEntityValues(localisedLangMap, localizedEntities) {
//   localisedLangMap.values = localisedLangMap.values.concat(localizedEntities);
//   return localisedLangMap;
// }

// function setLangMapValues(returnValues, langMap, key) {
//   returnValues.values = [].concat(langMap[key]);
// }
//
// function setLangCode(map, key, locale) {
//   if (undefinedLocaleCodes.includes(key)) {
//     map['code'] = '';
//   } else {
//     const langCode = normalizedLangCode(key);
//     map['code'] = locale !== langCode ? langCode : null; // output if different from UI language
//   }
// }

function normalizedLangCode(key) {
  return Object.prototype.hasOwnProperty.call(isoAlpha3Map, key) ? isoAlpha3Map[key] : key;
}
//
// function filterEntities(mappedObject) {
//   mappedObject.values = mappedObject.values.filter(v => !isEntity(v));
// }
