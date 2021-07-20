const utils = require('../utils');

const CACHE_KEY = '@europeana:portal.js:entity:topics';

let axiosClient;
let redisClient;

const ids = [
  '106',
  '112',
  '113',
  '114',
  '1146',
  '120',
  '124',
  '14',
  '1409',
  '15',
  '1594',
  '1600',
  '1603',
  '1618',
  '1645',
  '1647',
  '1653',
  '1654',
  '1659',
  '1664',
  '1665',
  '1668',
  '167',
  '1672',
  '1673',
  '17',
  '1700',
  '1705',
  '1710',
  '1719',
  '1720',
  '18',
  '187',
  '19',
  '190',
  '194',
  '23',
  '235',
  '236',
  '237',
  '238',
  '24',
  '247',
  '258',
  '277',
  '29',
  '30',
  '31',
  '321',
  '33',
  '35',
  '37',
  '41',
  '43',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51',
  '52',
  '54',
  '56',
  '59',
  '6',
  '60',
  '61',
  '62',
  '62',
  '74',
  '744',
  '79',
  '80',
  '84',
  '86'
];

const fetchEntity = async(id) => {
  const response = await axiosClient
    .get(`https://api.europeana.eu/entity/concept/base/${id}.json`, {
      params: { ...axiosClient.defaults.config }
    });
  const data = response.data;
  return {
    id: data.id,
    prefLabel: data.prefLabel,
    isShownBy: data.isShownBy
  };
};

const allTopics = async() => {
  const entities = [];
  for (const id of ids) {
    const entity = await fetchEntity(id);
    entities.push(entity);
  }

  return entities.sort((a, b) => (a.prefLabel.en > b.prefLabel.en) ? 1 : -1);
};

const writeToRedis = (data) => {
  return redisClient.setAsync(CACHE_KEY, JSON.stringify(data))
    .then(() => redisClient.quitAsync())
    .then(() => ({
      body: `Wrote ${Object.keys(data).length} topics to Redis "${CACHE_KEY}".`
    }));
};

const cache = async(config = {}) => {
  try {
    axiosClient = utils.createAxiosClient(config, 'entity');
    redisClient = utils.createRedisClient(config);

    const topics = await allTopics();

    return writeToRedis(topics);
  } catch (error) {
    return Promise.reject({ body: utils.errorMessage(error) });
  }
};

module.exports = {
  CACHE_KEY,
  cache
};
