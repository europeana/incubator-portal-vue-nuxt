// Basic navigation and identification steps taken from:
// https://markus.oberlehner.net/blog/acceptance-testing-with-nightwatch-and-cucumber-setup/

const { client } = require('nightwatch-api');
const { defineStep } = require('cucumber')

const { nestedSelector } = require('./nested-selector.js');

const { url } = require('../config/nightwatch.conf.js').test_settings.default.globals;

const pages = {
  'home page': `${url}/`,
  'search page': `${url}/search`
};

function wait(ms) { return new Promise((res) => setTimeout(res, ms)); }

defineStep(/^I (?:browse|open|visit).*? `(.*?)`$/, pageName =>
  client.url(pages[pageName]));

defineStep(/^I (?:find|identify|see|spot).*? (`.*`).*?$/, selectorChain =>
  client.expect.element(nestedSelector(selectorChain)).to.be.visible);

defineStep(/^I (?:can|don)'t (?:find|identify|see|spot).*? (`.*`).*?$/, selectorChain =>
  client.expect.element(nestedSelector(selectorChain)).to.not.be.present);

defineStep(/^I (?:enter|fill|input|supply|type).*? "(.*?)" in.*? (`.*`)$/, (value, selectorChain) =>
  client.setValue(nestedSelector(selectorChain), value));

defineStep(/^I (?:activate|click).*? (`.*`)$/, selectorChain =>
  client.click(nestedSelector(selectorChain)));

defineStep(/^I wait (.*) seconds?$/, seconds =>
  wait(seconds*1000));
