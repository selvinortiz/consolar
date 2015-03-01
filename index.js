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

var hasLogged      = false;
var prefixChar     = '-';
var currentStep    = 1;
var consoleCommand = '';

// @Definition
var Consolar = function() {
  this.cmd           = '';
  this.opts          = {};
  this.args          = [];
  this.namedArgs     = {};
  this.name          = 'Consolar';
  this.version       = '0.1.2';
  this.basePath      = __dirname;
  this.consoleInput  = [];
  this.commandPrefix = '';

  // @Stash
  this.swig   = swig;
  this.chalk  = chalk;
  this.lodash = lodash;
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
      if (self.hasConsoleCommand()) {
        args._ = [self.getConsoleCommand()].concat(args._);
      }

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
    this.logInfo(this.version);
    this.end();
  }

  if (this.shouldShowCommandHelp()) {
    this.renderCommandHelp();
    this.end();
  }

  if (this.shouldShowHelp()) {
    this.renderHelp();
    this.end();
  }

  this.runCommand();
};

/**
 * Sets the console command for the current session
 *
 * @note
 * This must be set by self running commands
 */
Consolar.prototype.setConsoleCommand = function(cmd) {
  consoleCommand = cmd;
};

Consolar.prototype.hasConsoleCommand = function() {
  return consoleCommand !== '' ? true : false;
};

Consolar.prototype.getConsoleCommand = function() {
  return consoleCommand;
};

Consolar.prototype.runCommand = function() {
  try {
    var cmd;

    if (this.hasConsoleCommand()) {
      cmd = require(this.basePath + '/index');
    } else {
      cmd = require(this.commandPrefix + this.normalizeCommand(this.cmd));
    }

    cmd.init(this);
    cmd.run();
  }
  catch(e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      this.logFailure('The %s command is not supported.', [this.cmd]);
    } else {
      this.logFailure(e.message);
    }

    this.halt();
  }
};

Consolar.prototype.renderHelp = function(data) {
  console.log(swig.renderFile(this.basePath + '/help.txt', data || this));
  process.exit();
};

Consolar.prototype.renderCommandHelp = function(data) {
  try {
    var cmd;

    if (this.hasConsoleCommand()) {
      cmd = require(this.basePath + '/index');
    } else {
      cmd = require(this.commandPrefix + this.normalizeCommand(this.cmd));
    }

    cmd.init(this);
    cmd.renderHelp();
  }
  catch(e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      this.logFailure('The %s command is not supported!', [this.cmd]);
    } else {
      this.logFailure(e.message);
    }

    this.halt();
  }
};

Consolar.prototype.shouldShowVersion = function() {
  return (lodash.has(this.opts, 'v') || lodash.has(this.opts, 'version'));
};

Consolar.prototype.shouldShowHelp = function() {
  if (this.hasConsoleCommand()) {
    return ((lodash.has(this.opts, 'h') || lodash.has(this.opts, 'help')) && lodash.isEmpty(this.cmd));
  }

  return (lodash.has(this.opts, 'h') || lodash.has(this.opts, 'help') || lodash.isEmpty(this.cmd));
};

Consolar.prototype.shouldShowCommandHelp = function() {
  if ((lodash.has(this.opts, 'h') || lodash.has(this.opts, 'help')) && !lodash.isEmpty(this.cmd)) {
    return true;
  }

  return false;
};

Consolar.prototype.requireArgs = function(requiredArgs) {
  var self     = this;
  var notFound = [];

  if (!lodash.isEmpty(requiredArgs)) {
    lodash.forEach(requiredArgs, function(arg, key) {
      if (lodash.isEmpty(self.args[key])) {
        notFound.push(arg);
      } else {
        self.namedArgs[arg] = self.args[key];
      }
    });
  }

  if (!lodash.isEmpty(notFound)) {
    this.logFailure('Missing required arguments.');

    lodash.forEach(notFound, function(arg, key) {
      self.log('* ' + arg);
    });

    this.renderCommandHelp();
  }
};

Consolar.prototype.requireOpts = function(which) {
  which = !lodash.isArray(which) ? which : [];

  var self     = this;
  var notFound = [];

  if (!lodash.isEmpty(which)) {
    lodash.forEach(which, function(opt, key) {
      if (!lodash.has(self.opts, opt)) {
        notFound.push(opt);
      }
    });
  }

  if (!lodash.isEmpty(notFound)) {
    this.logFailure('Missing required options.');
    lodash.forEach(notFound, function(opt, key) {
      self.log('* ' + opt);
    });

    this.renderCommandHelp();
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

Consolar.prototype.log = function(msg, data, type) {
  type = type || '';

  switch (type.toLowerCase()) {
    case 'info':
      msg = chalk.cyan(msg);
      break;
    case 'success':
      msg = chalk.green(msg);
      break;
    case 'warning':
      msg = chalk.yellow(msg);
      break;
    case 'failure':
      msg = chalk.red(msg);
      break;
    case 'step':
    default:
      msg = msg;
      break;
  }

  if (hasLogged === false) {
    hasLogged = true;
    msg = '\n' + msg;
  }

  if (lodash.isEmpty(data) || msg.indexOf('%') === -1) {
    console.log(msg);
  } else {
    console.log(msg, data);
  }
};

Consolar.prototype.logStep = function(msg, data) {
  this.log(currentStep + ' ' + msg + '...', data, 'step');
  currentStep++;
};

Consolar.prototype.logInfo = function(msg, data) {
  this.log(msg, data, 'info');
};

Consolar.prototype.logSuccess = function(msg, data) {
  this.log(msg, data, 'success');
};

Consolar.prototype.logFailure = function(msg, data) {
  this.log(msg, data, 'failure');
};

Consolar.prototype.logWarning = function(msg, data) {
  this.log(msg, data, 'warning');
};

Consolar.prototype.end = function(exitCode) {
  exitCode = exitCode || 0;

  process.exit(exitCode);
};

Consolar.prototype.halt = function() {
  this.end(255);
};

// @export
module.exports = (function() { return new Consolar(); })();
