const axios = require('axios');
const express = require('express');
const path = require('path');

// FIXME: modules should not require from other local modules like this
const { requestOrigin } = require(path.resolve(__dirname, '../http/templates/utils'));

const rc = require('./rc');

const app = express();

// TODO: enforce SSL unless disabled by env var, with env-configurable port awareness
app.get('/:locale/item/:dataset/:item.json', (req, res) => {
  const europeanaId = `/${req.params.dataset}/${req.params.item}`;
  const reqOrigin = requestOrigin(req);
  const apiConfig = rc[reqOrigin] || rc.defaults;

  let apiPath = apiConfig.record.path;
  if (!apiPath.endsWith('/record')) apiPath += '/record';

  axios.get(`${apiConfig.record.origin}${apiPath}${europeanaId}.json`, {
    params: {
      wskey: apiConfig.record.key
    }
  })
    .then((response) => {
      const deprecationNotice = '**** THIS .json METHOD IS DEPRECATED AND WILL BE REMOVED IN A FUTURE RELEASE. PLEASE VISIT /debug INSTEAD. ****';
      res.json({
        warning: deprecationNotice,
        ...response.data
      });
    })
    .catch((error) => {
      res.status(error.response.status || 500);
      res.json(error.response.data);
    });
});

export default app;
