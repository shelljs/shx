import shell from 'shelljs';

const badCommands = ['ShellString', 'cd', 'pushd', 'popd', 'dirs'];

const commandList = Object.keys(shell)
  .filter(cmd => typeof shell[cmd] === 'function' && badCommands.indexOf(cmd) === -1);

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
  ...(commandList.map(cmd => '    - ' + cmd)),
  '',
].join('\n');

export default () => help;
