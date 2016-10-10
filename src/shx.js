#!/usr/bin/env node
import shell from 'shelljs';
import minimist from 'minimist';
import help from './help';
import { CMD_BLACKLIST, EXIT_CODES, CONFIG_FILE } from './config';
import { printCmdRet } from './printCmdRet';
import path from 'path';
import fs from 'fs';
import objAssign from 'es6-object-assign';
objAssign.polyfill(); // modifies the global object

const pathExistsSync = (filePath) => {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (e) {
    return false;
  }
};

shell.help = help;

export const shx = (argv) => {
  const parsedArgs = minimist(argv.slice(2), { stopEarly: true, boolean: true });
  const [fnName, ...args] = parsedArgs._;
  if (!fnName) {
    console.error('Error: Missing ShellJS command name');
    console.error(help());
    return EXIT_CODES.SHX_ERROR;
  }

  // Load ShellJS plugins
  const CONFIG_PATH = path.join(process.cwd(), CONFIG_FILE);
  if (pathExistsSync(CONFIG_PATH)) {
    let shxConfig;
    try {
      shxConfig = require(CONFIG_PATH);
    } catch (e) {
      throw new Error(`Unable to read config file ${CONFIG_FILE}`);
    }

    (shxConfig.plugins || []).forEach((pluginName) => {
      try {
        require(pluginName);
      } catch (e) {
        throw new Error(`Unable to find plugin '${pluginName}'`);
      }
    });
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
      const match = arg.match(/^s\/(.*[^\\])\/(.*[^\\])\/(g?)$/);
      if (match && lookingForSubstString) {
        const regexString = match[1].replace(/\\\//g, '/');
        const replacement = match[2].replace(/\\\//g, '/').replace(/\\./g, '.');
        const regexFlags = match[3];
        newArgs.push(new RegExp(regexString, regexFlags));
        newArgs.push(replacement);
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

  if ((fnName === 'pwd' || fnName === 'which') && !ret.match(/\n$/) && ret.length > 1)
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
