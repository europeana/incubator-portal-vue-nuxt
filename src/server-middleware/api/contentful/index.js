import contentfulPlugin from '../../../plugins/contentful-graphql/plugin.server';
import { errorHandler } from '../';

export default ($config) => (req, res) => {
  const plugin = contentfulPlugin({ $config });

  const alias = req.params.alias;
  const variables = JSON.parse(req.query.variables);
  const ifNoneMatch = req.get('If-None-Match');

  if (plugin.ifNoneMatch(alias, variables, ifNoneMatch)) {
    return plugin.query(alias, variables)
      .then(response => {
        res.set('cache-control', 'public, no-cache');
        res.set('etag', response.etag);
        res.send(response.data);
      })
      .catch(error => errorHandler(res, error));
  } else {
    res.status(304);
    res.end();
  }
};
