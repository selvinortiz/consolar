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
  this.swig = swig;
  this.chalk = chalk;
  this.currentStep = 1;
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
  var args = minimist(self.input);

  lodash.forEach(args, function(value, key) {
    if (key === '_') {
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

  if (this.shouldShowVersion()) {
    console.log(this.version);
    process.exit();
  }

  if (this.shouldShowCommandHelp()) {
    this.renderCommandHelp();
    process.exit();
  }

  if (this.shouldShowHelp()) {
    this.renderHelp();
    process.exit();
  }

  this.runCommand();
};

Consolar.prototype.renderHelp = function(data) {
  console.log(swig.renderFile(this.path + '/help.txt', data || this));

  process.exit();
};

Consolar.prototype.runCommand = function() {
  var cmd;
  var name = this.name.toLowerCase() + '-' + this.cmd;

  try {
    cmd = require(name);

    cmd.init(this);
    cmd.run();
  }
  catch(e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      this.halt('The %s command is not supported!', [name]);
    }
  }
};

Consolar.prototype.renderCommandHelp = function(data) {
  var cmd;
  var name = this.name.toLowerCase() + '-' + this.cmd;

  try {
    cmd = require(name);

    cmd.init(this);
    cmd.renderHelp();
  }
  catch(e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      this.halt('The %s command is not supported!', [name]);
    }
  }
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

  return path.replace(this.name.toLowerCase() + '-', '');
};

Consolar.prototype.shouldShowHelp = function() {
  if (lodash.isEmpty(this.input)) {
    return true;
  }

  if (lodash.has(this.opts, 'h') || lodash.has(this.opts, 'help') && lodash.isEmpty(this.cmd)) {
    return true;
  }

  return false;
};

Consolar.prototype.shouldShowCommandHelp = function() {
  if (!lodash.isEmpty(this.cmd) && (lodash.has(this.opts, 'h') || lodash.has(this.opts, 'help'))) {
    return true;
  }

  return false;
};

Consolar.prototype.shouldShowVersion = function() {
  return lodash.has(this.opts, 'v') || lodash.has(this.opts, 'version');
};

Consolar.prototype.step = function(msg, data) {

  this.log('\n' + this.currentStep + ' ' + msg + '...', data);

  this.currentStep++;
};

Consolar.prototype.info = function(msg, data) {
  this.log(chalk.cyan(msg) + '\n', data);
  process.exit();
};

Consolar.prototype.done = function(msg, data) {
  this.log(chalk.green('✔ ' + msg) + '\n', data);
  process.exit();
};

Consolar.prototype.halt = function(msg, data) {
  this.log(chalk.red('✖ ' + msg) + '\n', data);
  process.exit(1);
};

Consolar.prototype.log = function(msg, data) {

  if (lodash.isEmpty(data) || msg.indexOf('%') === -1) {

    console.log(msg);
  } else {

    console.log(msg, data);
  }
};

// @export
module.exports = (function() { return new Consolar(); })();
