import axios from 'axios';
import nock from 'nock';

import * as annotations from '../../../../plugins/europeana/annotation';
import config from '../../../../modules/apis/defaults';

axios.defaults.adapter = require('axios/lib/adapters/http');

const apiKey = 'abcdef';

describe('plugins/europeana/entity', () => {
  beforeEach(() => {
    config.annotation.key = apiKey;
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('search', () => {
    it('searches Annotation API', async() => {
      const apiQuery = '*:*';
      nock(config.annotation.origin)
        .get(`${config.annotation.path}/search`)
        .query(query => {
          return query.query === apiQuery && query.wskey === apiKey;
        })
        .reply(200, {});

      await annotations.search({ query: apiQuery });

      nock.isDone().should.be.true;
    });
  });
});
