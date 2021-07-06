import sinon from 'sinon';
import redis from 'redis';

const utils = require('../../../../../src/cachers/entities/organisations/utils');

describe('cachers/entities/organisations/utils', () => {
  describe('createRedisClient', () => {
    const redisClientStub = ['del', 'get', 'set', 'hdel', 'hget', 'hkeys', 'hset', 'quit', 'on']
      .reduce((memo, key) => {
        memo[key] = sinon.spy();
        return memo;
      }, {});

    before('stub redis methods', () => {
      sinon.stub(redis, 'createClient').returns(redisClientStub);
    });
    after('restore redis methods', () => {
      redis.createClient.restore();
    });

    it('creates a redis client from params', () => {
      const params = {
        redisUrl: 'redis://localhost:6370/0'
      };

      utils.createRedisClient(params);

      redis.createClient.should.have.been.calledWith({ url: params.redisUrl });
    });

    it('adds an error handler to report to the console', () => {
      utils.createRedisClient();

      redisClientStub.on.should.have.been.calledWith('error', console.error);
    });

    it('defines async get, set and quit methods', () => {
      const redisClient = utils.createRedisClient();

      (typeof redisClient.getAsync).should.eq('function');
      (typeof redisClient.setAsync).should.eq('function');
      (typeof redisClient.quitAsync).should.eq('function');
    });
  });

  describe('errorMessage', () => {
    context('with property .response', () => {
      context('having property .data.error', () => {
        const error = { response: { data: { error: 'Uh oh' } } };
        it('uses property .response.data.error', () => {
          utils.errorMessage(error).should.eq(error.response.data.error);
        });
      });

      context('not having property .data.error', () => {
        const error = { response: { data: {}, status: 404, statusText: 'Not Found' } };
        it('combines properties .response.status and .response.statusText', () => {
          utils.errorMessage(error).should.eq('404 Not Found');
        });
      });
    });

    context('without property .response', () => {
      const error = { message: 'Uh oh' };
      it('uses property .message', () => {
        utils.errorMessage(error).should.eq(error.message);
      });
    });
  });
});
