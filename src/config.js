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
  'ShellString',
];

export const CONFIG_FILE = '.shxrc.json';
