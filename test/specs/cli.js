import * as shxModule from '../../src/shx';

const shx = sandbox.spy(shxModule, 'shx');
let stdout = '';
let stderr = '';
let code = null;

const mockConsoleLog = (...msgs) => {      // mock console.log
  stdout += `${msgs.join(' ')}\n`;
};

const mockConsoleError = (...msgs) => {    // mock console.error
  stderr += `${msgs.join(' ')}\n`;
};

const mockStdoutWrite = (msg) => {         // mock process.stdout.write
  stdout += msg;
  return true;
};

const mockProcessExit = (retCode) => {
  code = retCode || 0;
  throw { msg: 'process.exit was called',
          code,
  };
};

// Run the cli with args as argv
const cli = (...args) => {
  const oldArgv = process.argv;     // store original argv
  const oldConsoleLog = console.log;
  const oldConsoleError = console.error;
  const oldStdoutWrite = process.stdout.write;
  const oldProcessExit = process.exit;

  stdout = '';
  stderr = '';
  code = null;

  process.argv = ['', '', ...args]; // mock argv
  console.log = mockConsoleLog;
  console.error = mockConsoleError;
  process.stdout.write = mockStdoutWrite;
  process.exit = mockProcessExit;

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
  return { code, stdout, stderr };
};

describe('cli', () => {
  it('calls shx', () => {
    shx.should.have.not.been.called();
    const output = cli('echo');
    output.stdout.should.equal('\n');
    output.stderr.should.equal('');
    shx.should.have.been.called();
  });

  it('fails if no command name is given', () => {
    const output = cli();
    output.stdout.should.equal('');
    output.stderr.should.equal('Error: Missing ShellJS command name\n');
    output.code.should.equal(shxModule.EXIT_CODES.SHX_ERROR);
  });

  it('fails for unrecognized commands', () => {
    const output = cli('foobar');
    output.stdout.should.equal('');
    output.stderr.should.equal('Error: Invalid ShellJS command: foobar.\n');
    output.code.should.equal(shxModule.EXIT_CODES.SHX_ERROR);
  });

  it('fails for blacklisted commands', () => {
    const output = cli('cd', 'src');
    output.stdout.should.equal('');
    output.stderr.should.equal('Warning: shx cd is not supported\n');
    output.code.should.equal(shxModule.EXIT_CODES.SHX_ERROR);
  });

  it('returns error codes from commands', () => {
    const output = cli('ls', 'fakeFileName');
    output.stdout.should.equal('');
    output.stderr.should.equal('ls: no such file or directory: fakeFileName\n');
    output.code.should.equal(2);
  });

  it('does not print out boolean return values', () => {
    let output = cli('test', '-f', 'README.md'); // true
    output.stdout.should.equal('');
    output.stderr.should.equal('');
    output.code.should.equal(0);
    output = cli('test', '-L', 'src'); // false
    output.stdout.should.equal('');
    output.stderr.should.equal('');
    output.code.should.equal(1);
  });

  it('outputs to stdout', () => {
    const output = cli('echo', 'hello', 'world');
    output.stdout.should.equal('hello world\n');
    output.stderr.should.equal('');
  });

  it('appends a newline for pwd', () => {
    const output = cli('pwd');
    output.stdout[output.stdout.length - 1].should.equal('\n');
  });

  it('works for commands with no output', () => {
    let output = cli('cp', 'README.md', 'deleteme');
    output.stdout.should.equal('');
    output.stderr.should.equal('');
    output = cli('rm', 'deleteme'); // cleanup
    output.stdout.should.equal('');
    output.stderr.should.equal('');
  });
});
