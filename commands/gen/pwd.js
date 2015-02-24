var pwd = require('co-pwd');
var Pwd = function() {};

Pwd.prototype.run = function(cli) {
  if (cli.args.length < 1) {
    cli.logInfo('Usage: consolar co-pwd [mypassword]');
    process.exit(1);
  }

  pwd(cli.args[0], function(error, body) {

    if (error) {
      cli.logError(error);
      process.exit(1);
    }

    if (body.status !== 'OK') {
      cli.logError(body.result);
      process.exit(1);
    }

    cli.logSuccess(body.result);
    process.exit();
  });
};

module.exports = function() {

  var cmd = new Pwd();

  return cmd;
}();