'use strict';

// @dependencies
var swig     = require('swig');
var chalk    = require('chalk');
var lodash   = require('lodash');
var minimist = require('minimist');

// @filters
swig.setFilter('color', function(input, color) {
  return chalk[color].call(chalk, input);
});


var Consolar = function() {

  this.cmd;
  this.opts;
  this.args;
  this.name;
  this.version;
  this.input;
  this.path;
  //
  this.swig  = swig;
  this.chalk = chalk;
};

/**
 * @param {String} name    The console application name
 * @param {String} version The console application version (semver)
 * @param {String} path    The base path of the extending console application
 * @param {Array}  input   The input provided via the console if any
 */
Consolar.prototype.init = function(name, version, path, input) {
  this.cmd     = '';
  this.opts    = {};
  this.args    = [];
  this.name    = name || 'Consolar';
  this.version = version || '0.1.0';
  this.input   = input || process.argv.splice(2);
  this.path    = path || __dirname;

  var self = this;

  if (lodash.isEmpty(self.input)) {
    return self;
  }

  var args = minimist(self.input);

  lodash.forEach(args, function(value, key) {
    if (key === 'lodash') {
      lodash.forEach(args._, function(v, k) {
        if (k === 0) {
          self.cmd = v;
        } else {
          self.args.push(v);
        }
      });
    } else {
      self.opts[lodash.camelCase(key)] = value;
    }
  });

  return self;
};

Consolar.prototype.renderHelp = function(data) {
  console.log(swig.renderFile(this.path + '/help.txt', data || this));

  process.exit();
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

  return path.replace('so-', '');
};


// @export
module.exports = (function() { return new Consolar(); })();
