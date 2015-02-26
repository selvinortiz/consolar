#!/usr/bin/env node

var cli = require('./');

cli.halt('Console is not a standalone utility, use require() instead.');
