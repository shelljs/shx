import plugin from 'shelljs/plugin';

const shellTrue = () => '';

const shellFalse = () => {
  plugin.error('', { silent: true });
};

plugin.register('true', shellTrue, {
  allowGlobbing: false,
  wrapOutput: true,
});

plugin.register('false', shellFalse, {
  allowGlobbing: false,
  wrapOutput: true,
});

