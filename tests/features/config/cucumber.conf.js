/* eslint-disable no-console */

const { setDefaultTimeout, After, AfterAll, Before, BeforeAll } = require('cucumber');
const { client, createSession, closeSession, startWebDriver, stopWebDriver } = require('nightwatch-api');
const axios = require('axios');
const runners = require('../support/step-runners');

const path = require('path');

require(path.resolve(__dirname, '../support/step-definitions'));

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
const waitForAppUrl = require('./nightwatch.conf').test_settings.default.globals.url + '/robots.txt';
const maxWaitTime = 90;

const browserEnv = process.env.browser || 'gecko';
const nightwatchApiOptions = {
  configFile: path.resolve(__dirname, './nightwatch.conf.js'),
  env: browserEnv,
  silent: true
};

setDefaultTimeout(100000);

async function startBrowser() {
  await startWebDriver(nightwatchApiOptions);
  await createSession(nightwatchApiOptions);
}

async function stopBrowser() {
  await closeSession();
  await stopWebDriver();

  // Prevent MaxListenersExceededWarning warnings
  process.removeAllListeners();
}

// Request a file
async function warmupBrowser() {
  await runners.openAPage('/robots.txt');
}

async function waitForApp() {
  console.log(`Waiting for app URL ${waitForAppUrl}...`);
  let i = 0;

  while (i <= maxWaitTime) {
    try {
      const response = await axios.get(waitForAppUrl);
      if (response.status !== 200) throw new Error;
      console.log('Reached it');
      return;
    } catch (e) {
      i = i + 1;
      await sleep(1000);
    }
  }
  throw `Unable to reach the test server within ${maxWaitTime} seconds!`;
}

// Before running cucumber make sure the test server and webdriver are running.
// The test server is started by the test script in package.json.
// The web driver is started in this before block.
BeforeAll(async() => {
  await waitForApp();
  await startBrowser();
  await warmupBrowser();
});

Before({ tags: '@cookie-notice-not-dismissed' }, async() => {
  await runners.haveNotYetAcceptedCookies();
});

Before({ tags: 'not @cookie-notice-not-dismissed' }, async() => {
  await runners.havePreviouslyAcceptedCookies();
});

After(async() => {
  await client.deleteCookies();
});

After({ tags: '@non-default-browser' }, async() => {
  // Restore default browser config
  await stopBrowser();
  await startBrowser();
  await warmupBrowser();
});

AfterAll(async() => {
  await stopBrowser();
});
