/* eslint-disable no-console */

const { setDefaultTimeout, AfterAll, BeforeAll } = require('cucumber');
const { createSession, closeSession, startWebDriver, stopWebDriver } = require('nightwatch-api');
const isReachable = require('is-reachable');
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 1337;
const maxWaitTime = 50;

setDefaultTimeout(60000);

BeforeAll(async () => {
  const testServer = `${host}:${port}`;
  const browserEnv = process.env.browser || 'gecko';

  console.log(`Waiting for test server ${testServer}...`);
  let i = 0;
  while (!(await isReachable(testServer)) && (i <= maxWaitTime) ) {
    i++;
    await sleep(1000);
  }
  if (!(await isReachable(testServer))) {
    throw `Unable to reach the test server within ${maxWaitTime} seconds!`;
  }

  console.log(`Starting web driver for ${browserEnv}`);
  await startWebDriver({ configFile: 'tests/features/config/nightwatch.conf.js', env: browserEnv });

  await createSession({ configFile: 'tests/features/config/nightwatch.conf.js' });
});

AfterAll(async () => {
  await closeSession();
  await stopWebDriver();
});
