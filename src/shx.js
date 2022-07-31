import shell from 'shelljs';
import minimist from 'minimist';
import path from 'path';
import fs from 'fs';
import help from './help';
import { CMD_BLOCKLIST, EXIT_CODES, CONFIG_FILE } from './config';
import { printCmdRet } from './printCmdRet';

shell.help = help;

const convertSedRegex = (args) => {
  const newArgs = [];
  let lookingForSubstString = true;
  args.forEach((arg) => {
    // A regex or replacement string can be any sequence of zero or more
    // (a) non-slashes or (b) escaped chars.
    const escapedChar = '\\\\.'; // This may match an escaped slash (i.e., "\/")
    const nonSlash = '[^/]';
    const nonSlashSequence = `(?:${escapedChar}|${nonSlash})*`;
    const sedPattern = `^s/(${nonSlashSequence})/(${nonSlashSequence})/(g?)$`;
    const match = arg.match(new RegExp(sedPattern));
    if (match && lookingForSubstString) {
      const regexString = match[1].replace(/\\\//g, '/');
      const replacement = match[2].replace(/\\\//g, '/').replace(/\\./g, '.');
      const regexFlags = match[3];
      if (regexString === '') {
        // Unix sed gives an error if the pattern is the empty string, so we
        // forbid this case even though JavaScript's .replace() has well-defined
        // behavior.
        throw new Error('Bad sed pattern (empty regex)');
      }
      newArgs.push(new RegExp(regexString, regexFlags));
      newArgs.push(replacement);
      lookingForSubstString = false;
    } else {
      newArgs.push(arg);
    }
  });
  return newArgs;
};

export function shx(argv) {
  const parsedArgs = minimist(argv.slice(2), { stopEarly: true, boolean: true });
  if (parsedArgs.version) {
    const shxVersion = require('../package.json').version;
    const shelljsVersion = require('shelljs/package.json').version;
    console.log(`shx v${shxVersion} (using ShellJS v${shelljsVersion})`);
    return EXIT_CODES.SUCCESS;
  }
  const [fnName, ...args] = parsedArgs._;
  if (!fnName) {
    console.error('Error: Missing ShellJS command name');
    console.error(help());
    return EXIT_CODES.SHX_ERROR;
  }

  // Load ShellJS plugins
  const CONFIG_PATH = path.join(process.cwd(), CONFIG_FILE);
  if (fs.existsSync(CONFIG_PATH)) {
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

  // Always load true-false plugin
  require('./plugin-true-false');

  // validate command
  if (typeof shell[fnName] !== 'function') {
    console.error(`Error: Invalid ShellJS command: ${fnName}.`);
    console.error(help());
    return EXIT_CODES.SHX_ERROR;
  } else if (CMD_BLOCKLIST.indexOf(fnName) > -1) {
    console.error(`Warning: shx ${fnName} is not supported`);
    console.error('Please run `shx help` for a list of commands.');
    return EXIT_CODES.SHX_ERROR;
  }

  const input = this !== null ? new shell.ShellString(this) : null;

  // Set shell.config with parsed options
  Object.assign(shell.config, parsedArgs);

  // Workaround for sed syntax
  let ret;
  ret = shell[fnName].apply(input, fnName === 'sed' ? convertSedRegex(args) : args);

  if (ret === null) ret = shell.ShellString('', '', 1);

  if ((fnName === 'pwd' || fnName === 'which') && !ret.match(/\n$/) && ret.length > 1) {
    ret += '\n';
  }

  // echo already prints
  if (fnName !== 'echo') printCmdRet(ret);
  if (typeof ret === 'boolean') {
    return ret ? 0 : 1;
  }

  /* instanbul ignore next */
  const code = Object.prototype.hasOwnProperty.call(ret, 'code') && ret.code;

  if (typeof code === 'number') {
    return code;
  } else if (shell.error()) {
    /* istanbul ignore next */
    return EXIT_CODES.CMD_FAILED;
  }

  return EXIT_CODES.SUCCESS;
}
