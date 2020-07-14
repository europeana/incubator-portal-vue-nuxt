#!/bin/bash
set -ev

npm run lint
npm run stylelint
npm run test:unit
npm run size

if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
  npm run test:e2e:ci
else
  npm run test:e2e:ci:percy
fi
