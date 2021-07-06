import express from 'express';
const app = express();

import api from '../src/server-middleware/api';
app.use('/_api', api);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Listening on: http://localhost:${port}/`);
});
