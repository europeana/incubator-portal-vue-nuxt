const contentful = require('contentful');
const flatten = require('lodash/flatten');

const createRedisClient = require('../../../cachers/entities/organisations/utils').createRedisClient;

let contentfulClient;
let redisClient;

const linksToEntry = async(entry) => {
  const links = await contentfulClient.getEntries({
    'links_to_entry': entry.sys.id,
    include: 0
  });

  return links.items;
};

const deepLinksToEntry = async(entry) => {
  let deepLinks = [];
  const links = await linksToEntry(entry);
  for (const link of links) {
    deepLinks.push(link);
    const deeperLinks = await deepLinksToEntry(link);
    deepLinks = deepLinks.concat(deeperLinks);
  }
  return deepLinks;
};

const pageSlug = entry => (
  typeof entry.fields.identifier === 'string' ? entry.fields.identifier : entry.fields.identifier['en-GB']
);

const cachesToExpire = (entry) => {
  let caches = [];

  switch (entry.sys.contentType.sys.id) {
    case 'blogPosting':
      caches = [
        { key: 'blogFoyerPage' },
        { key: 'blogPostPage', field: { identifier: pageSlug(entry) } }
      ];
      break;
    case 'browsePage':
    case 'staticPage':
      caches = [
        { key: 'browseStaticPage', field: { identifier: pageSlug(entry) } }
      ];
      break;
    case 'entityPage':
      caches = [
        { key: 'collectionPage', field: { identifier: pageSlug(entry) } }
      ];
      break;
    case 'exhibitionChapterPage':
      caches = [
        { key: 'exhibitionChapterPage', field: { identifier: pageSlug(entry) } }
      ];
      break;
    case 'exhibitionPage':
      caches = [
        { key: 'exhibitionLandingPage', field: { identifier: pageSlug(entry) } },
        { key: 'exhibitionCreditsPage', field: { identifier: pageSlug(entry) } }
      ];
      break;
    case 'imageGallery':
      caches = [
        { key: 'galleryFoyerPage' },
        { key: 'galleryPage', field: { identifier: pageSlug(entry) } }
      ];
      break;
  }

  return caches;
};

const expireCache = async({ key, field }) => {
  const cacheHashKey = `@europeana:portal.js:contentful:${key}`;
  if (field) {
    const hashFields = await redisClient.hkeysAsync(cacheHashKey);
    for (const hashField of hashFields) {
      if (new URLSearchParams(hashField).get('identifier') === field.identifier) {
        console.log('HDEL', cacheHashKey, hashField);
        redisClient.hdel(cacheHashKey, hashField);
      }
    }
  } else {
    console.log('DEL', cacheHashKey);
    redisClient.del(key);
  }
};

export default ($config) => async(req, res) => {
  contentfulClient = contentful.createClient({
    space: $config.contentful.spaceId,
    environment: $config.contentful.environmentId,
    accessToken: $config.contentful.accessToken.delivery
  });
  redisClient = createRedisClient({
    redisUrl: $config.redis.url,
    redisTlsCa: $config.redis.tlsCa
  });

  const entry = req.body;

  const expireEntries = [entry]
    .concat(await deepLinksToEntry(entry));

  const expire = flatten(expireEntries.map(cachesToExpire));
  for (const toExpire of expire) {
    expireCache(toExpire);
  }

  return res.send('OK');
};
