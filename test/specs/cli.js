import * as shxModule from '../../src/shx';
import { EXIT_CODES } from '../../src/config';
import * as mocks from '../mocks';
import * as shell from 'shelljs';

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

  it('fails if no command name is given', () => {
    const output = cli();
    output.stdout.should.equal('');
    output.stderr.should.include('Error: Missing ShellJS command name\n');
    output.stderr.should.include('Usage'); // make sure help is printed
    output.code.should.equal(EXIT_CODES.SHX_ERROR);
  });

  it('fails for unrecognized commands', () => {
    const output = cli('foobar');
    output.stdout.should.equal('');
    output.stderr.should.include('Error: Invalid ShellJS command: foobar.\n');
    output.stderr.should.include('Usage'); // make sure help is printed
    output.code.should.equal(EXIT_CODES.SHX_ERROR);
  });

  it('fails for blacklisted commands', () => {
    const output = cli('cd', 'src');
    output.stdout.should.equal('');
    output.stderr.should.include('Warning: shx cd is not supported\n');
    output.stderr.should.include('help'); // make we tell them to use help.
    output.code.should.equal(EXIT_CODES.SHX_ERROR);
  });

  it('returns error codes from commands', () => {
    const output = cli('ls', 'fakeFileName');
    output.stdout.should.equal('');
    output.stderr.should.equal('ls: no such file or directory: fakeFileName\n');
    output.code.should.equal(2);
  });

  it('does not print out boolean return values', () => {
    let output = cli('test', '-f', 'README.md');  // true
    output.stdout.should.equal('');
    output.stderr.should.equal('');
    output.code.should.equal(0);
    output = cli('test', '-L', 'src');            // false
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
    output = cli('rm', 'deleteme'); // cleanup, but also test rm's output
    output.stdout.should.equal('');
    output.stderr.should.equal('');
  });

  it('allows --silent to change config.silent', () => {
    const output = cli('--silent', 'ls', 'fakeFileName');
    output.stdout.should.equal('');
    output.stderr.should.equal('');
    output.code.should.equal(2);
  });

  describe('sed', () => {
    const testFileName1 = 'foo.txt';
    const testFileName2 = 's/weirdfile/name/g';
    beforeEach(() => {
      // create test files
      shell.touch(testFileName1);
      shell.ShellString('foo\nfoosomething\nfoofoosomething\n').to(testFileName1);

      shell.mkdir('-p', 's/weirdfile/name');
      shell.touch(testFileName2);
      shell.ShellString('foo\nfoosomething\nfoofoosomething\n').to(testFileName2);
    });

    afterEach(() => {
      shell.rm('-f', testFileName1);
      shell.rm('-rf', 's/');
    });

    it('works with no /g and no -i', () => {
      const output = cli('sed', 's/foo/bar/', testFileName1);
      output.stdout.should.equal('bar\nbarsomething\nbarfoosomething\n');
      shell.cat(testFileName1).stdout.should.equal('foo\nfoosomething\nfoofoosomething\n');
    });

    it('works with /g and -i', () => {
      const output = cli('sed', '-i', 's/foo/bar/g', testFileName1);
      output.stdout.should.equal('bar\nbarsomething\nbarbarsomething\n');
      shell.cat(testFileName1).stdout.should.equal('bar\nbarsomething\nbarbarsomething\n');
    });

    it('works with weird file names', () => {
      const output = cli('sed', 's/foo/bar/', testFileName2);
      output.stdout.should.equal('bar\nbarsomething\nbarfoosomething\n');
      shell.cat(testFileName2).stdout.should.equal('foo\nfoosomething\nfoofoosomething\n');
    });
  });
});
