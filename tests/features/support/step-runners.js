/**
 * @file Nightwatch interactions
 * @see {@link http://nightwatchjs.org/api#expect-api|Nightwatch Expect assertions}
 */

const { client } = require('nightwatch-api');
const { europeanaId } = require('./europeana-identifiers.js');
const { url } = require('../config/nightwatch.conf.js').test_settings.default.globals;

const pages = {
  'home page': `${url}/`,
  'search page': `${url}/search`,
  'record page': `${url}/record${europeanaId()}`,
  'first page of results': `${url}/search?query=&page=1`
};

/**
 * Generate CSS selector for `data-qa` attribute values.
 * Given a scalar argument a single selector will be returned.
 * Given an array as argument, a descendant selector will be generated, <em>for
 * the reverse order of the elements</em>, i.e. last element is the ancestor,
 * first is the descendant.
 * @param {(string|string[])} qaElementNames one or more `data-qa` attribute values
 * @return {string} CSS selector
 */
function qaSelector(qaElementNames) {
  return [qaElementNames]
    .flat()
    .map(name => name ? `[data-qa="${name}"]` : '')
    .reverse()
    .join(' ');
}

function pageUrl(pageName) {
  return pageName.startsWith('/') ? `${url}${pageName}` : pages[pageName];
}

module.exports = {
  openAPage: async function (pageName) {
    await client.url(pageUrl(pageName));
  },
  clickOnTheTarget: async function (qaElementNames) {
    const selector = qaSelector(qaElementNames);
    await client.expect.element(selector).to.be.visible;
    await client.click(selector);
  },
  seeATarget: async function (qaElementNames) {
    await client.expect.element(qaSelector(qaElementNames)).to.be.visible;
  },
  doNotSeeATarget: async function (qaElementNames) {
    await client.expect.element(qaSelector(qaElementNames)).to.not.be.present;
  },
  seeATargetWithText: async function (qaElementNames, text) {
    await client.expect.element(qaSelector(qaElementNames)).text.to.contain(text);
  },
  waitSomeSeconds: async function (seconds) {
    await client.pause(seconds * 1000);
  },
  shouldBeOn: async function (pageName) {
    // TODO: update if a less verbose syntax becomes available.
    // See https://github.com/nightwatchjs/nightwatch/issues/861
    await client.url(async (currentUrl) => {
      await client.expect(currentUrl.value).to.eq(pageUrl(pageName));
    });
  },
  enterTextInTarget: async function (text, qaElementName) {
    const selector = qaSelector(qaElementName);
    await client.expect.element(selector).to.be.visible;
    await client.setValue(selector, text);
  },
  checkTheCheckbox: async function (inputValue) {
    await client.click(`input[type="checkbox"][value="${inputValue}"]`);
  },
  seeALinkInTarget: async function (linkHref, qaElementName) {
    await client.expect.element(qaSelector(qaElementName) + ` a[href="${linkHref}"]`).to.be.visible;
  },
  waitForTargetToBeVisible: async function (qaElementName) {
    await client.waitForElementVisible(qaSelector(qaElementName));
  }
};
