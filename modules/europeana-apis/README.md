# Module: europeana-apis

This module is responsible for loading and supplying to the app configuration
for Europeana APIs, including their origin, path and authentication key.

## Configuration

API keys may be supplied in environment variables:
* `EUROPEANA_ENTITY_API_KEY`: Entity API key
* `EUROPEANA_NEWSPAPER_API_KEY`: Newspaper API key
* `EUROPEANA_RECORD_API_KEY`: Record API key, and Newspaper API key if
  `EUROPEANA_NEWSPAPER_API_KEY` is not set
