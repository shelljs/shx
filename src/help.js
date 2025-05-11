const shell = require('shelljs');
const { CMD_BLOCKLIST, OPTION_BLOCKLIST } = require('./config');

// Global options defined directly in shx.
const locallyDefinedOptions = ['version', 'negate'];

const shxOptions = Object.keys(shell.config)
  .filter((key) => typeof shell.config[key] !== 'function')
  .filter((key) => OPTION_BLOCKLIST.indexOf(key) === -1)
  .concat(locallyDefinedOptions)
  .map((key) => `    * --${key}`);

module.exports = () => {
  // Note: compute this at runtime so that we have all plugins loaded.
  const commandList = Object.keys(shell)
    .filter((cmd) => typeof shell[cmd] === 'function')
    .filter((cmd) => CMD_BLOCKLIST.indexOf(cmd) === -1)
    .map((cmd) => `    * ${cmd}`);

  return `
shx: A wrapper for shelljs UNIX commands.

Usage: shx [shx-options] <command> [cmd-options] [cmd-args]

Example:

    $ shx ls .
    foo.txt
    baz.js
    $ shx rm -rf *.txt && shx ls .
    baz.js

Commands:

${commandList.join('\n')}

Shx Options (please see https://github.com/shelljs/shelljs for details on each
option):

${shxOptions.join('\n')}
`;
};
