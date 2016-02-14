#!/usr/bin/env node
var shell = require('shelljs');

if (process.argv.length < 3) {
  console.error('Error: Missing ShellJS command name');
  process.exit(1);
}

// ['foo', 'bar;baz;quz', 'qux'] => [['foo', 'bar'], ['baz'], ['quz'], ['qux']]
function parseArgs(args) {
  var cmds = [[]]; // An array of commands to run, each command is an array of [cmd, ...args]
  for (var i = 0; i < args.length; ++i) {
    var parts = args[i].split(';'); // You're allowed to separate commands with semicolons.
    cmds[0].push(parts.shift().trim()); // Add the first thing in the array to the current command
    if (parts.length !== 0) { // If there was >0 semicolons, then...
      cmds.unshift([]); // Start a new command
      args[i] = parts.join(';'); // Try it again, without the part we just handled.
      --i;
    }
  }
  // We store the commands in reverse order so that we can get the current one with cmds[0],
  // so reverse them before returning it.
  return cmds.reverse();
}

var cmds = parseArgs(process.argv.slice(2));

var failed = false; // If something fails, we want to do everything else, but still exit 1

for (var i = 0; i < cmds.length; ++i) {
  if (!cmds[i]) continue; // If you did foo;bar;baz;
  var cmd = shell[cmds[i][0]];
  if (!cmd || typeof cmd !== 'function') throw new Error('Error: Invalid ShellJS command: ' + cmd);
  var ret = cmd.apply(shell, cmds[i].slice(1));
  if (ret && typeof ret.stdout !== 'undefined' && typeof ret.stderr !== 'undefined') {
    if (ret.stdout) console.log(ret.stdout);
    if (ret.stderr) console.error(ret.stderr);
  } else if (ret && ret.output) {
    console.log(ret.output);
  } else if (ret && Array.isArray(ret)) {
    console.log(ret.join('\n'));
  } else if (ret) {
    console.log(ret);
  }

  if (shell.error() || (ret && ret.code && ret.code !== 0)) failed = true;
}

if (failed) process.exit(1);
