'use strict';

var _ = require('lodash');
var m = require('minimist');
var c = require('chalk');

var Consolar  = function(input) {
  this.cmd    = '';
  this.opts   = {};
  this.args   = [];
  this.errors = [];
  this.input  = input || process.argv.splice(2);
};

Consolar.prototype.init = function() {
  var self = this;

  if (_.isEmpty(self.input)) {
    self.errors.push(new Error('No input was provided'));
    return self;
  }

  var args = m(self.input);

  _.forEach(args, function(value, key) {
    if (key === '_') {
      _.forEach(args._, function(v, k) {
        if (k === 0) {
          self.cmd = v;
        } else {
          self.args.push(v);
        }
      });
    } else {
      self.opts[_.camelCase(key)] = value;
    }
  });

  return self;
};

/**
 * Returns the path equivalent of a namespaced command
 *
 * @example
 * generate:password > generate/password
 *
 * @param string cmd
 *
 * @return string
 */
Consolar.prototype.cmdToPath = function(cmd) {
  cmd = cmd || this.cmd;

  if (cmd.indexOf(':') === -1) {
    var path = cmd;
  } else {
    var path = cmd.replace(/:/g, '/');
  }

  return path.replace('co-', '');
};

Consolar.prototype.logInfo = function(msg) {
  console.log(c.white(msg));
};

Consolar.prototype.logError = function(msg) {
  console.log(c.red.bold(msg));
};

Consolar.prototype.logSuccess = function(msg) {
  console.log(c.green.bold(msg));
};

module.exports = function(input) {

  var cli = new Consolar(input);

  return cli.init();
}();
