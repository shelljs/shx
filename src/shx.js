#!/usr/bin/env node
var shell = require('shelljs');
var parseArgs = require('./parseArgs');
var printCmdRet = require('./printCmdRet');

var EXIT_CODES = {
  SHX_ERROR: 27, // https://xkcd.com/221/
  CMD_FAILED: 1, // TODO: Once shelljs/shelljs#269 lands, use `error()`
  SUCCESS: 0,
};

var CMD_BLACKLIST = [
  'cd',
  'pushd',
  'popd',
  'dirs',
  'set',
  'exit',
  'exec',
];

function shx(argv) {
  if (argv.length < 3) {
    console.error('Error: Missing ShellJS command name');
    return EXIT_CODES.SHX_ERROR;
  }

  var cmds = parseArgs(argv.slice(2));

  // If something fails, we want to execute all the commands, but still error at the end.
  var failed = false;

  for (var i = 0; i < cmds.length; ++i) {
    if (!cmds[i]) continue; // If you did foo;bar;baz;
    var cmd = shell[cmds[i][0]];
    if (!cmd || typeof cmd !== 'function') {
      console.error('Error: Invalid ShellJS command: ' + cmd);
      return EXIT_CODES.SHX_ERROR;
    } else if (CMD_BLACKLIST.indexOf(cmd) > -1) {
      console.error('Warning: shx ' + cmd + ' is not supported');
      return EXIT_CODES.SHX_ERROR;
    }

    var ret = cmd.apply(shell, cmds[i].slice(1));
    if (cmd.name !== '_echo') {
      printCmdRet(ret);
    }
    if (shell.error() || (ret && ret.code && ret.code !== 0)) failed = true;
  }

  return failed ? EXIT_CODES.CMD_FAILED : EXIT_CODES.SUCCESS;
}

module.exports = shx;
