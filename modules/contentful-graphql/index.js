const camelCase = require('camelcase');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const MODULE_NAME = 'contentful-graphql';

const graphqlPaths = glob.sync(path.resolve(__dirname, './queries/*.graphql'));

const graphqlQueries = graphqlPaths.reduce((memo, graphqlPath) => {
  const basename = path.basename(graphqlPath, '.graphql');
  const alias = camelCase(basename);
  memo[alias] = fs.readFileSync(graphqlPath, 'utf8');
  return memo;
}, {});

module.exports = function() {
  this.addTemplate({
    src: path.resolve(__dirname, path.join('templates', 'queries.ejs')),
    fileName: path.join(MODULE_NAME, 'queries.js'),
    options: graphqlQueries
  });

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: path.join(MODULE_NAME, 'plugin.js')
  });
};
