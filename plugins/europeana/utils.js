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
  const iterableValues = ((typeof(values) === 'string') ? [values] : values || []);
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
 * @param {Object} The LangMap
 * @param {String} locale Current locale as a 2 letter code
 * @return {{Object[]{language: String, values: Object[]}}} Language code and values, values may be strings or language maps themselves.
 */
export function langMapValueForLocale(langMap, locale) {
  let returnVal = { values: [] };
  for (let key of languageKeys(locale)) { // loop through all language key to find a match
    setLangMapValuesAndCode(returnVal, langMap, key, locale);
    if (returnVal['values'].length >= 1) break;
  }

  // No preferred language found, so just add the first
  if (returnVal['values'].length === 0) {
    setLangMapValuesAndCode(returnVal, langMap, Object.keys(langMap)[0], locale);
  }

  return addEntityValues(returnVal, entityValues(langMap['def'], locale));
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
    setLangMapValues(returnValue, langMap, key, locale);
    setLangCode(returnValue, key, locale);
    if (undefinedLocaleCodes.includes(key)) filterEntities(returnValue);
  } else if (isJSONLDExpanded(langMap)) {
    const matchedValue = langMapValueFromJSONLD(langMap, key);
    if (matchedValue) returnValue['values'] = [matchedValue];
    setLangCode(returnValue, key, locale);
  }
}

function addEntityValues(localizedLangmap, localizedEntities) {
  localizedLangmap['values'] = localizedLangmap['values'].concat(localizedEntities);
  return localizedLangmap;
}

function setLangMapValues(returnValues, langMap, key) {
  returnValues['values'] = [].concat(langMap[key]);
}

function setLangCode(map, key, locale) {
  if (undefinedLocaleCodes.includes(key)) {
    map['code'] = '';
  } else {
    const langCode = normalizedLangCode(key);
    map['code'] = locale !== langCode ? langCode : null; // output if different from UI language
  }
}

function normalizedLangCode(key) {
  return key.length === 3 ? isoAlpha3Map[key] : key; // if there is a match, find language code
}

function filterEntities(mappedObject) {
  mappedObject['values'] = mappedObject['values'].filter(v => !isEntity(v));
}
