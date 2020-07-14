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
  return !!value && !!value.about;
}

function entityValues(values, locale) {
  const iterableValues = ((typeof (values) === 'string') ? [values] : values || []);
  const iterableEntities = iterableValues.filter((value) => isEntity(value));
  return iterableEntities.map((value) => entityValue(value, locale));
}

function entityValue(value, locale) {
  if (value.prefLabel) {
    let entityValue = langMapValueForLocale(value.prefLabel, locale);
    if (entityValue.values.length === 0) entityValue = { code: '', values: [value.about] };
    entityValue.about = value.about;
    return entityValue;
  }
  return { code: '', values: [value.about], about: value.about };
}

function languageKeys(locale) {
  const localeFallbackKeys = undefinedLocaleCodes.concat(languageKeyMap.en);
  return languageKeysWithFallbacks[locale] || localeFallbackKeys;
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
  let returnVal = { values: [] };
  for (let key of languageKeys(locale)) { // loop through all language key to find a match
    setLangMapValuesAndCode(returnVal, langMap, key, locale);
    if (returnVal.values.length >= 1) break;
  }

  // No preferred language found, so just add the first
  if (returnVal.values.length === 0) {
    setLangMapValuesAndCode(returnVal, langMap, Object.keys(langMap)[0], locale);
  }

  let withEntities = addEntityValues(returnVal, entityValues(langMap['def'], locale));
  // In case an entity resolves as only its URI as is the case in search responses
  // as no linked entity data is returned so the prefLabel can't be retrieved.
  if (onlyUriValues(withEntities.values) && returnVal.code === '' && hasNonDefValues(langMap)) {
    withEntities = localizedLangMapFromFirstNonDefValue(langMap);
  }
  if (options.omitAllUris) return omitAllUris(withEntities);
  if (!options.omitUrisIfOtherValues) return withEntities;
  return omitUrisIfOtherValues(withEntities);
}

function omitUrisIfOtherValues(localizedLangmap) {
  const withoutUris = localizedLangmap.values.filter((value) => !uriRegex.test(value));
  if (withoutUris.length > 0) localizedLangmap.values = withoutUris;

  return localizedLangmap;
}

function omitAllUris(localizedLangmap) {
  const withoutUris = localizedLangmap.values.filter((value) => !uriRegex.test(value));
  localizedLangmap.values = withoutUris;

  return localizedLangmap;
}

function localizedLangMapFromFirstNonDefValue(langMap) {
  for (let key in langMap) {
    if (key !== 'def') {
      return { values: langMap[key], code: key };
    }
  }
}

function hasNonDefValues(langMap) {
  const keys = Object.keys(langMap);
  return  keys.some((key) => {
    return key !== 'def';
  });
}

// check if values are exclusively URIs.
function onlyUriValues(values) {
  return values.every((value) => uriRegex.test(value));
}

function isJSONLDExpanded(values) {
  return values[0] && Object.prototype.hasOwnProperty.call(values[0], '@language');
}

function langMapValueFromJSONLD(value, locale) {
  const forCurrentLang = value.find(element => element['@language'] === locale);
  return forCurrentLang && forCurrentLang['@value'];
}

function setLangMapValuesAndCode(returnValue, langMap, key, locale) {
  if (langMap[key]) {
    langMapValueAndCodeFromMap(returnValue, langMap, key, locale);
  } else if (isJSONLDExpanded(langMap)) {
    langMapValueAndCodeFromJSONLD(returnValue, langMap, key, locale);
  }
}

function langMapValueAndCodeFromMap(returnValue, langMap, key, locale) {
  setLangMapValues(returnValue, langMap, key, locale);
  setLangCode(returnValue, key, locale);
  if (undefinedLocaleCodes.includes(key)) filterEntities(returnValue);
}

function langMapValueAndCodeFromJSONLD(returnValue, langMap, key, locale) {
  const matchedValue = langMapValueFromJSONLD(langMap, key);
  if (matchedValue) returnValue.values = [matchedValue];
  setLangCode(returnValue, key, locale);
}

function addEntityValues(localizedLangmap, localizedEntities) {
  localizedLangmap.values = localizedLangmap.values.concat(localizedEntities);
  return localizedLangmap;
}

function setLangMapValues(returnValues, langMap, key) {
  returnValues.values = [].concat(langMap[key]);
}

function setLangCode(map, key, locale) {
  if (undefinedLocaleCodes.includes(key)) {
    map['code'] = '';
  } else {
    const langCode = normalizedLangCode(key);
    map['code'] = locale === langCode ? null : langCode; // output if different from UI language
  }
}

function normalizedLangCode(key) {
  return key.length === 3 ? isoAlpha3Map[key] : key; // if there is a match, find language code
}

function filterEntities(mappedObject) {
  mappedObject.values = mappedObject.values.filter(v => !isEntity(v));
}
