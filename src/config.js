import minimist from 'minimist';

export const EXIT_CODES = {
  SHX_ERROR: 27, // https://xkcd.com/221/
  CMD_FAILED: 1, // TODO: Once shelljs/shelljs#269 lands, use `error()`
  SUCCESS: 0,
};

export const CMD_BLOCKLIST = [
  'cd',
  'pushd',
  'popd',
  'dirs',
  'set',
  'exit',
  'exec',
  'ShellString',
];

export const OPTION_BLOCKLIST = [
  'globOptions', // we don't have good control over globbing in the shell
  'execPath', // we don't currently support exec
  'bufLength', // we don't use buffers in shx
  'maxdepth', // this option is undocumented, add this back if it makes sense
];

export const CONFIG_FILE = '.shxrc.json';

export const SHELLJS_PIPE_INFO = {
  cat: { minArgs: 1 },
  grep: { minArgs: 2 },
  head: { minArgs: 1 },
  sed: { minArgs: 2 },
  sort: { minArgs: 1 },
  tail: { minArgs: 1 },
  uniq: { minArgs: 1 },
};

// All valid options
const allOptionsList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  .split('');

export const shouldReadStdin = (args) => {
  const cmd = args[0];
  const cmdInfo = SHELLJS_PIPE_INFO[cmd];
  const parsedArgs = minimist(args.slice(1), {
    stopEarly: true,
    boolean: allOptionsList, // treat all short options as booleans
  });
  let requiredNumArgs = cmdInfo ? cmdInfo.minArgs : -1;

  // If a non-boolean option is passed in, increment the required argument
  // count (this is the case for `-n` for `head` and `tail`)
  if (parsedArgs.n && (cmd === 'head' || cmd === 'tail')) {
    requiredNumArgs++;
  }

  return Boolean(!process.stdin.isTTY && parsedArgs._.length < requiredNumArgs);
};
