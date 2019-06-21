let stdoutValue = '';
let stderrValue = '';
let stdinValue = null;

const oldConsoleLog = console.log;
const oldConsoleError = console.error;
const oldStdoutWrite = process.stdout.write;
const oldProcessExit = process.exit;

const consoleLog = (...msgs) => { // mock console.log
  stdoutValue += `${msgs.join(' ')}\n`;
};

const consoleError = (...msgs) => { // mock console.error
  stderrValue += `${msgs.join(' ')}\n`;
};

const stdoutWrite = (msg) => { // mock process.stdout.write
  stdoutValue += msg;
  return true;
};

const processExit = (retCode) => { // mock process.exit
  const e = {
    msg: 'process.exit was called',
    code: retCode || 0,
  };
  throw e;
};

const resetValues = () => {
  stdoutValue = '';
  stderrValue = '';
};

export const stdout = () => stdoutValue;
export const stderr = () => stderrValue;
export const stdin = (val) => {
  // If called with no arg, return the mocked stdin. Otherwise set stdin to that
  // arg
  if (val === undefined) return stdinValue;
  stdinValue = val;
  return null;
};

export const init = () => {
  resetValues();
  console.log = consoleLog;
  console.error = consoleError;
  process.stdout.write = stdoutWrite;
  process.exit = processExit;
};

export const restore = () => {
  console.log = oldConsoleLog;
  console.error = oldConsoleError;
  process.stdout.write = oldStdoutWrite;
  process.exit = oldProcessExit;
};
