#!/usr/bin/env node

var _   = require('lodash')
var cli = require('./index');
var pkg = require('./package.json');

if (cli.errors.length) {
  _.forEach(cli.errors, function(value, key) {
    cli.logError(value);
  });

  process.exit(1);
};

if (!cli.cmd || cli.cmd === '') {
  cli.logError('No command was provided');

  process.exit(1);
}

var cmd = require('./commands/' + cli.cmdToPath());

cmd.run(cli);