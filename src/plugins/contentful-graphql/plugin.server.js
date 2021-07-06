import axios from 'axios';
import md5 from 'md5';

// TODO: move `createRedisClient` and other related utils up to cachers dir
import { createRedisClient } from '../../cachers/entities/organisations/utils';

import queries from './queries';

let $axios;
let $redis;

export default ({ app, $config }, inject) => {
  if (!$axios) {
    const origin = 'https://graphql.contentful.com';
    const path = `/content/v1/spaces/${$config.contentful.spaceId}/environments/${$config.contentful.environmentId || 'master'}`;

    $axios = axios.create({
      baseURL: `${origin}${path}`
    });

    if (app && app.$axiosLogger) {
      $axios.interceptors.request.use(app.$axiosLogger);
    }
  }

  if ($config.redis.url && !$redis) {
    $redis = createRedisClient({
      redisUrl: $config.redis.url,
      redisTlsCa: $config.redis.tlsCa
    });
  }

  const plugin = {
    $axios,

    $redis,

    key(alias, variables = {}) {
      return `@europeana:portal.js:contentful:${alias}:${new URLSearchParams(variables).toString()}`;
    },

    query(alias, variables = {}) {
      const cacheHashKey = this.key(alias, variables);
      // const cacheHashField =
      return this.$redis ? this.cachedOrFresh(alias, variables, cacheHashKey) : this.fresh(cacheHashKey);
    },

    async ifNoneMatch(alias, variables, ifNoneMatch) {
      if (!ifNoneMatch) {
        return false;
      }
      const cacheHashKey = this.key(alias, variables);
      const etag = await this.$redis.hgetAsync(cacheHashKey, 'etag');
      return etag !== ifNoneMatch;
    },

    fresh(alias, variables, cacheHashKey) {
      const accessToken = variables.preview ? $config.contentful.accessToken.preview : $config.contentful.accessToken.delivery;
      const headers = {
        'Authorization': `Bearer ${accessToken}`
      };
      const body = {
        query: queries[alias],
        variables
      };

      return this.$axios.post('', body, { headers })
        .then(ctfResponse => {
          const fresh = ctfResponse.data;
          const etag = `W/"${md5(fresh)}"`;
          return {
            data: fresh,
            etag
          };
        })
        .then(response => {
          if (this.$redis) {
            this.$redis.hset(cacheHashKey, 'data', JSON.stringify(response.data));
            this.$redis.hset(cacheHashKey, 'etag', response.etag);
          }

          return Promise.resolve(response);
        });
    },

    cachedOrFresh(alias, variables, cacheHashKey) {
      return this.$redis.hgetallAsync(cacheHashKey)
        .then(cached => (
          cached ? Promise.resolve({ etag: cached.etag, data: JSON.parse(cached.data) }) : this.fresh(alias, variables, cacheHashKey))
        );
    }
  };

  if (inject) {
    inject('contentful', plugin);
  }

  return plugin;
};
