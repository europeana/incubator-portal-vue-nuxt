// Patch for test coverage of Vue files with Istanbul.
//
// Presumed by the test env config in vue.config.js
//
// Courtesy of: https://gist.github.com/lsapan/3bfd0ffc0fb3d4a036fce84f6eea142e
// See: https://github.com/istanbuljs/istanbuljs/issues/464

const fs = require('fs');

const path = 'node_modules/istanbul-lib-source-maps/lib/get-mapping.js';
const find = 'source: pathutils.relativeTo(start.source, origFile),';
const replace = 'source: origFile,';

const original = fs.readFileSync(path, 'utf8');
if (original.includes(find)) {
  fs.writeFileSync(path, original.replace(find, replace));
}
