#!/usr/bin/env node
import shell from 'shelljs';
import parseArgs from './parseArgs';
import printCmdRet from './printCmdRet';

const EXIT_CODES = {
  SHX_ERROR: 27, // https://xkcd.com/221/
  CMD_FAILED: 1, // TODO: Once shelljs/shelljs#269 lands, use `error()`
  SUCCESS: 0,
};

const CMD_BLACKLIST = [
  'cd',

  'pushd',
  'popd',
  'dirs',
  'set',
  'exit',
  'exec',
];

const shx = (argv) => {
  if (argv.length < 3) {
    console.error('Error: Missing ShellJS command name');
    return EXIT_CODES.SHX_ERROR;
  }

  const cmds = parseArgs(argv.slice(2));
  let failed = false;

  for (let i = 0; i < cmds.length; i += 1) {
    const [fn, ...args] = cmds[i];
    if (typeof shell[fn] !== 'function') {
      console.error(`Error: Invalid ShellJS command: ${fn}`);
      return EXIT_CODES.SHX_ERROR;
    } else if (CMD_BLACKLIST.includes(fn)) {
      console.error(`Warning: shx ${fn} is not supported`);
      return EXIT_CODES.SHX_ERROR;
    }

    const ret = shell[fn].apply(shell, args);
    const { code } = ret;

    printCmdRet(ret);
    if (!shell.error() && code === 0) failed = true;
  }

  return failed ? EXIT_CODES.CMD_FAILED : EXIT_CODES.SUCCESS;
};

export default shx;
