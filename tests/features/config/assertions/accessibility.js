const util = require('util');

function script(context, options, done) {
  if (!window.axe) done({ error: 'aXe not found. Make sure it has been injected' });

  window
    .axe
    .run(context, options)
    .then(results => {
      done({ results });
    })
    .catch(error => {
      done({ error: error.toString() });
    });
}

exports.assertion = function(context, config) {
  const FAILURE_MSG = 'Accessibility violations found: %s \n\n%s';
  const PASS_MSG = '%d aXe a11y tests passed';

  this.message = null;
  this.results = null;
  this.expected = null;

  this.pass = function() {
    const passed = !this.results.violations.length;

    if (passed) {
      this.message = util.format(PASS_MSG, this.results.passes.length);
    }

    return passed;
  };

  this.failure = function(result) {
    const violations = result.value.results.violations;
    let failMessage = '';

    for (const violation of violations) {
      failMessage += '# ' + violation.impact + ': ' + violation.help + ' (' + violation.helpUrl + ')\n';
    }

    this.expected = 0;
    this.message = util.format(FAILURE_MSG, result.value.results.violations.length, failMessage);

    return false;
  };

  this.value = function(result) {
    this.results = result.value.results;

    if (this.results.violations.length) {
      return this.results.violations.length;
    }
    return result.value;
  };

  this.command = function(callback) {
    this.api.executeAsync(script, [context, config], result => {
      callback(result);
    });
    return this;
  };
};
