import shell from 'shelljs';
import { CMD_BLACKLIST } from './config';

export default () => {
  const commandList = Object.keys(shell)
    .filter(cmd => typeof shell[cmd] === 'function' && CMD_BLACKLIST.indexOf(cmd) === -1);

  return `
shx: A wrapper for shelljs UNIX commands.

Usage: shx <command> [options]

Example:

    $ shx ls .
    foo.txt
    bar.txt
    baz.js
    $ shx rm -rf *.txt
    $ shx ls .
    baz.js

Commands:

${commandList.map(cmd => `    - ${cmd}`).join('\n')}
`;
};
