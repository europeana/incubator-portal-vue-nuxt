require('dotenv').config();
const axios = require('axios');
const recordOrigin = 'https://api.europeana.eu';
const apiKey = process.env['EUROPEANA_RECORD_API_KEY'];

const getRecord = async(identifier) => {
  const url = recordOrigin + '/record/search.json';
  return axios.get(url, {
    params: {
      wskey: apiKey,
      profile: 'minimal',
      query: `europeana_id:"${identifier}"`,
      rows: 1
    }
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

module.exports = (migration) => {
  if (!apiKey) throw new Error('No "EUROPEANA_RECORD_API_KEY" detected.');

  migration.transformEntries({
    contentType: 'automatedRecordCard',
    from: ['identifier', 'encoding'],
    to: ['encoding'],
    transformEntryForLocale: async(fromFields, currentLocale) => {
      if (currentLocale !== 'en-GB' || !fromFields.identifier) return;
      if (fromFields.encoding) return;

      const record = await getRecord(fromFields.identifier[currentLocale]);
      if (record.itemsCount === 1 && record.items) {
        const encoding = record.items[0];
        return { encoding };
      }
    },
    shouldPublish: 'preserve'
  });
};
