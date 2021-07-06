const express = require('express');
const morgan = require('morgan');
const defu = require('defu');

const app = express();
app.disable('x-powered-by'); // Security: do not disclose technology fingerprints
app.use(express.json());
app.use(morgan('combined'));

let runtimeConfig;
app.use((res, req, next) => {
  if (!runtimeConfig) {
    // Load Nuxt config once, at runtime
    const nuxtConfig = require('../../../nuxt.config');
    runtimeConfig = defu(nuxtConfig.privateRuntimeConfig, nuxtConfig.publicRuntimeConfig);
  }
  next();
});

const debugMemoryUsage = require('./debug/memory-usage');
app.get('/debug/memory-usage', debugMemoryUsage);

import contentfulWebhook from './contentful/webhook';
app.post('/contentful/webhook', (req, res) => contentfulWebhook(runtimeConfig)(req, res));

import contentful from './contentful';
app.get('/contentful/:alias', (req, res) => contentful(runtimeConfig)(req, res));

import entitiesOrganisations from './entities/organisations';
app.get('/entities/organisations', (req, res) => entitiesOrganisations(runtimeConfig)(req, res));

import jiraServiceDesk from './jira/service-desk';
app.post('/jira/service-desk', (req, res) => jiraServiceDesk(runtimeConfig.jira)(req, res));

const version = require('./version');
app.get('/version', version);

app.all('/*', (req, res) => res.sendStatus(404));

export const errorHandler = (res, error) => {
  if (error.response) {
    res.status(error.response.status).set('Content-Type', 'text/plain').send(error.response.data.errorMessage);
  } else {
    res.status(500).set('Content-Type', 'text/plain').send(error.message);
  }
};

export default app;
