import * as shxModule from '../../src/shx';

const shx = sandbox.spy(shxModule, 'shx');
let stdout = '';

const mockConsoleLog = (...msgs) => {      // mock console.log
  stdout += `${msgs.join(' ')}\n`;
  return undefined;
};

const mockStdoutWrite = (msg) => {      // mock process.stdout.write
  stdout += msg;
  return true;
};

// Run the cli with args as argv
const cli = (...args) => {
  const oldArgv = process.argv;     // store original argv
  const oldConsoleLog = console.log;
  const oldStdoutWrite = process.stdout.write;
  stdout = '';
  process.argv = ['', '', ...args]; // mock argv
  console.log = mockConsoleLog;
  process.stdout.write = mockStdoutWrite;

  sandbox.stub(process, 'exit');    // prevent cli from exiting test process

  require('../../src/cli');         // run cli

  process.exit.restore();           // restore stuff
  process.argv = oldArgv;
  console.log = oldConsoleLog;
  process.stdout.write = oldStdoutWrite;

  delete require.cache[require.resolve('../../src/cli')]; // invalidate cache
  return stdout;
};

describe('cli', () => {
  it('calls shx', () => {
    shx.should.have.not.been.called();
    const output = cli('echo');
    output.should.equal('\n');
    shx.should.have.been.called();
  });

  it('outputs to stdout', () => {
    const output = cli('echo', 'hello', 'world');
    output.should.equal('hello world\n');
  });

  it('appends a newline for pwd', () => {
    const output = cli('pwd');
    output[output.length - 1].should.equal('\n');
  });

  it('works for commands with no output', () => {
    let output = cli('cp', 'README.md', 'deleteme');
    output.should.equal('');
    output = cli('rm', 'deleteme'); // cleanup
    output.should.equal('');
  });
});
