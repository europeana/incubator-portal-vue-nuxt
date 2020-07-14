/**
 * @file Global Vue filters
 * @see {@link https://vuejs.org/v2/guide/filters.html}
 */

import Vue from 'vue';
import marked from 'marked';

Vue.filter('localise', val => {
  if (typeof val === 'undefined' || val === null) {
    return val;
  }
  return val.toLocaleString('en');
});

Vue.filter('truncate', (val, char, ellipsis) => {
  if (!val) return null;
  return val.length > char ? val.substring(0, char) + ellipsis : val;
});

// TODO: deprecated; superceded by OptimisedImage.vue; remove when all dependent components updated
Vue.filter('optimisedImageUrl', (imageUrl, contentType, options = {}) => {
  if (typeof contentType !== 'string') return imageUrl;

  let imageQueryParams = [];

  const hostnameMatch = imageUrl.match(/\/\/([^/]+)\//);
  if (hostnameMatch && (hostnameMatch[1] === 'images.ctfassets.net')) {
    // TODO: are optimisations possible on any other content types?
    if (contentType === 'image/jpeg') {
      imageQueryParams.push('fm=jpg&fl=progressive');
      imageQueryParams.push(`q=${options.quality || 50}`);
    }

    if (options.width) imageQueryParams.push(`w=${options.width}`);
    if (options.height) imageQueryParams.push(`h=${options.height}`);
  }

  if (imageQueryParams.length > 0) imageUrl += '?' + imageQueryParams.join('&');

  return imageUrl;
});

const htmlRemovalPatternsFromTags = (tags) => {
  return [/\n$/].concat(tags.map((tag) => new RegExp(`</?${tag}.*?>`, 'gi')));
};

/**
 * Strip markdown from text.
 * This method FIRST converts markdown to HTML, then removes HTML tags.
 * WARNING: This also means any HTML tags already present before will be stripped.
 *
 * As an optional parameter specific HTML tag names can be supplied. In which case,
 * only these will be removed.
 * @param {string} text String containing mark1down
 * @param {string[]} tags the HTML tags to be removed.
 * @return {String} text value with HTML breaks
 */
Vue.filter('stripMarkdown', (text, tags = ['']) => {
  text = marked(text); // Marked adds newlines to the end of the string, and wraps it in a <p> tag.
  for (const pattern of htmlRemovalPatternsFromTags(tags)) {
    text = text.replace(pattern, '');
  }
  return text;
});

/**
 * Convert new lines to <br/>
 * @param {string} val text value
 * @return {String} text value with HTML breaks
 */
Vue.filter('convertNewLine', (val) => {
  return val.replace(/\n/g, '<br/>');
});

Vue.filter('urlWithProtocol', (url) => url.startsWith('//') ? `https:${url}` : url);
