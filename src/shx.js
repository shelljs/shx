#!/usr/bin/env node
import shell from 'shelljs';
import minimist from 'minimist';
import help from './help';
import { CMD_BLACKLIST, EXIT_CODES } from './config';
import { printCmdRet } from './printCmdRet';

shell.help = help;

export const shx = (argv) => {
  const parsedArgs = minimist(argv.slice(2), { stopEarly: true, boolean: true });
  const [fnName, ...args] = parsedArgs._;
  if (!fnName) {
    console.error('Error: Missing ShellJS command name');
    console.error(help());
    return EXIT_CODES.SHX_ERROR;
  }

  // validate command
  if (typeof shell[fnName] !== 'function') {
    console.error(`Error: Invalid ShellJS command: ${fnName}.`);
    console.error(help());
    return EXIT_CODES.SHX_ERROR;
  } else if (CMD_BLACKLIST.indexOf(fnName) > -1) {
    console.error(`Warning: shx ${fnName} is not supported`);
    console.error('Please run `shx help` for a list of commands.');
    return EXIT_CODES.SHX_ERROR;
  }

  // Set shell.config with parsed options
  Object.assign(shell.config, parsedArgs);

  // Workaround for sed syntax
  let newArgs;
  let ret;
  if (fnName === 'sed') {
    newArgs = [];
    let lookingForSubstString = true;
    args.forEach((arg) => {
      const match = arg.match(/^s\/(.*)\/(.*)\/(g?)$/);
      if (match && lookingForSubstString) {
        newArgs.push(new RegExp(match[1], match[3]));
        newArgs.push(match[2]);
        lookingForSubstString = false;
      } else {
        newArgs.push(arg);
      }
    });
    ret = shell[fnName](...newArgs);
  } else {
    ret = shell[fnName](...args);
  }
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
