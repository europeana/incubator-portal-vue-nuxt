// Setup for cucumber environments.

module.exports = {
  all: './**/*.feature --require ./config/cucumber.conf.js --format node_modules/cucumber-pretty',
  collections: './collections/**/*.feature --require ./config/cucumber.conf.js --format node_modules/cucumber-pretty',
  common: './common/**/*.feature --require ./config/cucumber.conf.js --format node_modules/cucumber-pretty',
  default: '--require ./config/cucumber.conf.js --format node_modules/cucumber-pretty',
  pages: './pages/**/*.feature --require ./config/cucumber.conf.js --format node_modules/cucumber-pretty',
  search: './search/**/*.feature --require ./config/cucumber.conf.js --format node_modules/cucumber-pretty',
  visual: './visual/**/*.feature --require ./config/cucumber.conf.js --format node_modules/cucumber-pretty'
};
