# Consolar
Simple console utility framework

## Features
- Parses console input using [minimist](https://github.com/substack/minimist)
- Converts _long options_ to [camelCase](https://lodash.com/docs#camelCase)
- Displays the console version (`-v, --version`)
- Displays console or command help (`-h, --help`)
- Handles input requirement validation
- Runs chosen command when `init()` is called

## Install
```sh
$ npm install --save consolar
```

## Usage
**Consolar** is meant to be used as a supporting module for console utilities that implement a specific design pattern where all _commands_ are written and usable separately and then brough together to behave as a complete console application in the more traditional sense.

```js
var cli = require('consolar');

cli.init({
    name: 'Cli',
    version: '1.0.0',
    basePath: __dirname,
    consoleInput: process.argv.splice(2),
    commandPrefix: 'cli'
});
```

## License
MIT &copy; [Selvin Ortiz](http://selv.in "Selvin Ortiz")