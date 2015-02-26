# Consolar
Utility for argument parsing and output decoration

## Features
- Parses arguments using [minimist](https://github.com/substack/minimist)
- Converts _long options_ to [camelCase](https://lodash.com/docs#camelCase)
- Automatic display of version number (`-v, --version`)
- Automatic display of console and command help (`-h, --help`)
- Runs chosen command when initialize

## Install
```sh
$ npm install --save consolar
```

## Usage
**Consolar** is meant to be used as a supporting utility for console applications that implement a specific design pattern where all _commands_ are written and usable separately and then brough together to behave as a complete console application in the more traditional sense.

```sh
$ node index.js greet --caps "Good Morning" --name="Selvin Ortiz"
```

Given the input above, `consolar` will populate the following.

```js
var cli = require('consolar');

cli.init('Cli', '0.1.1', __basedir);

console.log(cli.cmd);  // greet
console.log(cli.opts); // {caps: true, name: 'Selvin Ortiz'}
console.log(cli.args); // ['Good Morning']
```

## License
MIT &copy; [Selvin Ortiz](http://selv.in "Selvin Ortiz")