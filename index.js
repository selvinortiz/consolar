'use strict';

// @Dependencies
var swig     = require('swig');
var chalk    = require('chalk');
var lodash   = require('lodash');
var minimist = require('minimist');

// @Filters
swig.setFilter('color', function(input, color) {
  // {{ 'text'|color('cyan|green') }}
  return chalk[color].call(chalk, input);
});

swig.setFilter('primary', function(input) {
  // {{ name|primary }}
  return chalk.cyan(input);
});

swig.setFilter('secondary', function(input) {
  // {{ version|secondary }}
  // {{ 'Usage:'|secondary }}
  // {{ 'Commands:'|secondary }}
  return chalk.yellow(input);
});

swig.setFilter('accent', function(input) {
  // {{ 'cmd'|accent }}
  // {{ '-h, --help'|accent }}
  return chalk.green(input);
});

var prefixChar  = '-';
var currentStep = 1;

// @Definition
var Consolar = function() {
  this.cmd           = '';
  this.opts          = {};
  this.args          = [];
  this.name          = 'Consolar';
  this.version       = '0.1.2';
  this.basePath      = __dirname;
  this.consoleInput  = [];
  this.commandPrefix = 'consolar';

  // @Stash
  this.swig  = swig;
  this.chalk = chalk;
};

Consolar.prototype.init = function(config) {
  this.name          = lodash.result(config, 'name', this.name);
  this.version       = lodash.result(config, 'version', this.version);
  this.basePath      = lodash.result(config, 'basePath', this.basePath);
  this.consoleInput  = lodash.result(config, 'consoleInput', process.argv.splice(2));
  this.commandPrefix = lodash.result(config, 'commandPrefix', this.name.toLowerCase()) + prefixChar;

  var self = this;
  var args = minimist(self.consoleInput);

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

Consolar.prototype.runCommand = function() {
  var name = this.commandPrefix + this.normalizeCommand(this.cmd);

  try {
    var cmd = require(name);

    cmd.init(this);
    cmd.run();
  }
  catch(e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      this.halt('The %s command is not supported.', [this.cmd]);
    }
  }
};

Consolar.prototype.renderHelp = function(data) {
  console.log(swig.renderFile(this.basePath + '/help.txt', data || this));
  process.exit();
};

Consolar.prototype.renderCommandHelp = function(data) {
  var name = this.commandPrefix + this.normalizeCommand(this.cmd);

  try {
    var cmd = require(name);

    cmd.init(this);
    cmd.renderHelp();
  }
  catch(e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      this.halt('The %s command is not supported!', [name]);
    }
  }
};

Consolar.prototype.normalizeCommand = function(cmd) {
  cmd = cmd || this.cmd;

  if (cmd.indexOf(':') === -1) {
    var path = cmd;
  } else {
    var path = cmd.replace(/:/g, '-');
  }

  return path.replace(this.commandPrefix, '');
};

Consolar.prototype.shouldShowHelp = function() {
  if (lodash.isEmpty(this.consoleInput)) {
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

  this.log('\n' + currentStep + ' ' + msg + '...', data);

  currentStep++;
};

Consolar.prototype.info = function(msg, data) {
  this.log(chalk.cyan(msg) + '\n', data);
  process.exit();
};

Consolar.prototype.done = function(msg, data) {
  this.log(chalk.green(msg) + '\n', data);
  process.exit();
};

Consolar.prototype.halt = function(msg, data) {
  this.log(chalk.red(msg) + '\n', data);
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
