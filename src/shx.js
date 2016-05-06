#!/usr/bin/env node
import shell from 'shelljs';
import help from './help';
import { CMD_BLACKLIST, EXIT_CODES } from './config';
import { printCmdRet } from './printCmdRet';

shell.help = help;

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
  } else if (CMD_BLACKLIST.indexOf(fnName) > -1) {
    console.error(`Warning: shx ${fnName} is not supported`);
    return EXIT_CODES.SHX_ERROR;
  }

  let ret = shell[fnName](...args);
  if (ret === null)
    ret = shell.ShellString('', '', 1);
  let code = ret.hasOwnProperty('code') && ret.code;

  if ((fnName === 'pwd' || fnName === 'which') && !ret.endsWith('\n') && ret.length > 1)
    ret += '\n';

  // echo already prints
  if (fnName !== 'echo') printCmdRet(ret);
  if (typeof ret === 'boolean')
    code = ret ? 0 : 1;

  if (typeof code === 'number') {
    return code;
  } else if (shell.error()) {
    return EXIT_CODES.CMD_FAILED;
  }

  return EXIT_CODES.SUCCESS;
};
