import shell from 'shelljs';

const commandList = Object.keys(shell)
  .filter(cmd => typeof shell[cmd] === 'function' && cmd !== 'ShellString');

const help = [
  'shx: A wrapper for shelljs UNIX commands.',
  '',
  'Example:',
  '',
  '    $ shx ls .',
  '    foo.txt',
  '    bar.txt',
  '    baz.js',
  '    $ shx rm -rf *.txt',
  '    $ shx ls .',
  '    baz.js',
  '',
  'Commands:',
  '',
  ...(commandList.map(cmd => '    - ' + cmd)) + '\n',
  '',
].join('\n');

export default () => help;
