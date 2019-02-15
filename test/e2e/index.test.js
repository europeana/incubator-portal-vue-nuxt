import test from 'ava';
import nock from 'nock';
import createNuxt from '../helpers/createNuxt.js';

// We keep a reference to Nuxt so we can close
// the server at the end of the test
let nuxt;

// Init Nuxt.js and start listening on localhost:4000
test.before('Init Nuxt.js', async () => {
  nuxt = await createNuxt();
  return nuxt;
});

test.before('Mock Contentul API', async () => {
  const json = require('../fixtures/contentful/homepage.json');
  nock('https://cdn.contentful.com')
    .get(/^\/spaces\//)
    .query(query => {
      if (query['fields.identifier'] === '/') {
        return true;
      }
    })
    .reply(200, json);
});

// Test output of page-level headline and text fields
test('Route / exists and renders HTML', async t => {
  let context = {};
  const { html } = await nuxt.renderRoute('/', context);
  t.true(/<title[^>]*>Home<\/title>/.test(html));
  t.true(html.includes('<p>We transform the world with culture!</p>'));
});

// Close the Nuxt server
test.after('Closing server', () => {
  nuxt.close();
});
