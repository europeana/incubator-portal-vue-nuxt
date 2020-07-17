/* eslint-disable camelcase */

const path = require('path');
const chromedriver = require('chromedriver');
const geckodriver = require('geckodriver');
const percy = require('@percy/nightwatch');

function chrome(locale = 'en-GB', args = []) {
  args = [
    '--disable-gpu',
    `--lang=${locale}`,
    '--allow-insecure-localhost',
    '--window-size=1400,1000'
  ].concat(args);

  return {
    webdriver: {
      start_process: false,
      server_path: chromedriver.path,
      cli_args: ['--port=4444', '--whitelisted-ips', '--verbose']
    },
    desiredCapabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args,
        prefs: {
          'intl.accept_languages': locale
        }
      }
    }
  };
}

function headlessChrome(locale = 'en-GB') {
  return chrome(locale, ['--headless']);
}

module.exports = {
  custom_commands_path: [percy.path, path.resolve(__dirname, '../node_modules/nightwatch-accessibility/commands')],
  custom_assertions_path: [path.resolve(__dirname, './assertions')],
  test_settings: {
    default: {
      globals: {
        url: process.env.NIGHTWATCH_E2E_TEST_ORIGIN || 'http://localhost:3001'
      },
      webdriver: {
        start_process: false,
        port: 4444
      },
      desiredCapabilities: {
        javascriptEnabled: true,
        acceptSslCerts: true,
        acceptInsecureCerts: true
      }
    },
    chrome: chrome(),
    'chrome-ja': chrome('ja'),
    'chrome-nl': chrome('nl'),
    chromeHeadless: headlessChrome(),
    'chromeHeadless-ja': headlessChrome('ja'),
    'chromeHeadless-nl': headlessChrome('nl'),
    gecko: {
      webdriver: {
        server_path: geckodriver.path
      },
      desiredCapabilities: {
        browserName: 'firefox',
        alwaysMatch: {
          acceptInsecureCerts: true,
          'moz:firefoxOptions': {
            args: ['-headless', '-verbose']
          }
        }
      }
    }
  }
};
