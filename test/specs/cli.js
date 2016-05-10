import * as shxModule from '../../src/shx';
import * as mocks from '../mocks';

const shx = sandbox.spy(shxModule, 'shx');

// Run the cli with args as argv
const cli = (...args) => {
  const oldArgv = process.argv;     // store original argv
  const oldConsoleLog = console.log;
  const oldConsoleError = console.error;
  const oldStdoutWrite = process.stdout.write;
  const oldProcessExit = process.exit;

  mocks.resetValues();
  let code = null;

  process.argv = ['', '', ...args]; // mock argv
  console.log = mocks.consoleLog;
  console.error = mocks.consoleError;
  process.stdout.write = mocks.stdoutWrite;
  process.exit = mocks.processExit;

  try {
    require('../../src/cli');         // run cli
  } catch (e) {
    code = e.code;
  }

  // restore stuff
  process.argv = oldArgv;
  console.log = oldConsoleLog;
  console.error = oldConsoleError;
  process.stdout.write = oldStdoutWrite;
  process.exit = oldProcessExit;

  delete require.cache[require.resolve('../../src/cli')]; // invalidate cache
  return { code,
           stdout: mocks.getStdout(),
           stderr: mocks.getStderr(),
  };
};

describe('cli', () => {
  it('calls shx', () => {
    shx.should.have.not.been.called();
    const output = cli('echo');
    output.stdout.should.equal('\n');
    output.stderr.should.equal('');
    shx.should.have.been.called();
  });

  it('works for commands with no output', () => {
    let output = cli('cp', 'README.md', 'deleteme');
    output.stdout.should.equal('');
    output.stderr.should.equal('');
    output = cli('rm', 'deleteme'); // cleanup, but also test rm's output
    output.stdout.should.equal('');
    output.stderr.should.equal('');
  });
});
