#!/usr/bin/env node
import shell from 'shelljs';
import printCmdRet from './printCmdRet';

export const EXIT_CODES = {
  SHX_ERROR: 27, // https://xkcd.com/221/
  CMD_FAILED: 1, // TODO: Once shelljs/shelljs#269 lands, use `error()`
  SUCCESS: 0,
};

export const CMD_BLACKLIST = [
  'cd',
  'pushd',
  'popd',
  'dirs',
  'set',
  'exit',
  'exec',
];

export const shx = (argv) => {
  const [fnName, ...args] = argv.slice(2);
  if (!fnName) {
    console.error('Error: Missing ShellJS command name');
    return EXIT_CODES.SHX_ERROR;
  }

  // validate command
  if (typeof shell[fnName] !== 'function') {
    console.error(`Error: Invalid ShellJS command: ${fnName}.`);
    return EXIT_CODES.SHX_ERROR;
  } else if (CMD_BLACKLIST.includes(fnName)) {
    console.error(`Warning: shx ${fnName} is not supported`);
    return EXIT_CODES.SHX_ERROR;
  }

  const ret = shell[fnName](...args);
  const code = ret.hasOwnProperty('code') && ret.code;

  // echo already prints
  if (fnName !== 'echo') printCmdRet(ret);

  if (typeof code === 'number') {
    return code;
  } else if (shell.error()) {
    return EXIT_CODES.CMD_FAILED;
  }

  return EXIT_CODES.SUCCESS;
};
