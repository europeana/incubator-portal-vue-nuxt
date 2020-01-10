import merge, { emptyTarget } from 'deepmerge';

/**
 * Page to request, from an API endpoint (Europeana/Contentful/?)
 * If parameter is not present, returns default of page 1.
 * If parameter is present, and represents a positive integer, return it
 * typecast to Number.
 * Otherwise, parameter is invalid for page number, and return `null`.
 * @param {string} queryPage `page` query parameter from URL
 * @return {?number}
 */
export function pageFromQuery(queryPage) {
  if (queryPage) {
    if (/^[1-9]\d*$/.test(queryPage)) {
      return Number(queryPage);
    } else {
      return null;
    }
  } else {
    return 1;
  }
}

/**
 * See: https://github.com/TehShrike/deepmerge#arraymerge-example-combine-arrays
 */
export function combineMerge(target, source, options) {
  const destination = target.slice();

  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.isMergeableObject(item) ? merge(emptyTarget(item), item, options) : item;
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options);
    } else if (target.indexOf(item) === -1) { // Only add values not yet present
      destination.push(item);
    }
  });
  return destination;
}
