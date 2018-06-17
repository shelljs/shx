import { shx } from '../../src/shx';
import { EXIT_CODES, CONFIG_FILE, shouldReadStdin } from '../../src/config';
import * as mocks from '../mocks';
import * as shell from 'shelljs';
import fs from 'fs';
import path from 'path';
import 'should';

const skipIf = (cond, ...args) => {
  if (cond) {
    it.skip.apply(it, args);
  } else {
    it.apply(this, args);
  }
};

// Run the cli with args as argv
const cli = (...args) => {
  mocks.init();
  const stdin = mocks.stdin();

  let code;
  try {
    code = shx.call(stdin, ['', '', ...args]);
  } catch (e) {
    if (e.hasOwnProperty('code')) {
      // Shx is returning an error with a specified code
      code = e.code;
    } else {
      // Shx is throwing an exception
      throw e;
    }
  } finally {
    mocks.restore();
  }

  return { code,
           stdout: mocks.stdout(),
           stderr: mocks.stderr(),
  };
};

describe('cli', () => {
  beforeEach(() => {
    // Clear this out before the test, so that the test can mock the value if
    // necessary
    mocks.stdin(null);
  });

  it('calls shx', () => {
    const output = cli('echo');
    output.stdout.should.equal('\n');
    output.stderr.should.equal('');
  });

  it('fails if no command name is given', () => {
    const output = cli();
    output.stdout.should.equal('');
    output.stderr.should.match(/Error: Missing ShellJS command name\n/);
    output.stderr.should.match(/Usage/); // make sure help is printed
    output.code.should.equal(EXIT_CODES.SHX_ERROR);
  });

  it('fails for unrecognized commands', () => {
    const output = cli('foobar');
    output.stdout.should.equal('');
    output.stderr.should.match(/Error: Invalid ShellJS command: foobar.\n/);
    output.stderr.should.match(/Usage/); // make sure help is printed
    output.code.should.equal(EXIT_CODES.SHX_ERROR);
  });

  it('fails for blacklisted commands', () => {
    const output = cli('cd', 'src');
    output.stdout.should.equal('');
    output.stderr.should.match(/Warning: shx cd is not supported\n/);
    output.stderr.should.match(/help/); // make we tell them to use help.
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

  describe('global flags', () => {
    it('supports --version', () => {
      const output = cli('--version');
      output.stdout.should.match(/shx v\S+ \(using ShellJS v\S+\)\n/);
      output.stderr.should.equal('');
      output.code.should.equal(0);
    });

    it('allows --silent to change config.silent', () => {
      const output = cli('--silent', 'ls', 'fakeFileName');
      output.stdout.should.equal('');
      output.stderr.should.equal('');
      output.code.should.equal(2);
    });
  });

  describe('stdin', () => {
    const oldTTY = process.stdin.isTTY;
    after(() => {
      process.stdin.isTTY = oldTTY;
    });

    it('has basic support', () => {
      mocks.stdin('foo\nbar\nfoobar');
      const output = cli('grep', 'foo');
      output.stdout.should.equal('foo\nfoobar\n');
      output.stderr.should.equal('');
      output.code.should.equal(0);
    });

    it('reads stdin for commands that accept stdin', () => {
      process.stdin.isTTY = undefined;
      shouldReadStdin(['cat']).should.equal(true);
      shouldReadStdin(['head']).should.equal(true);
      shouldReadStdin(['sed', 's/foo/bar/g']).should.equal(true);
      shouldReadStdin(['grep', 'a.*z']).should.equal(true);
    });

    it('reads stdin if only options are given', () => {
      process.stdin.isTTY = undefined;
      shouldReadStdin(['head', '-n', '1']).should.equal(true);
      shouldReadStdin(['grep', '-i', 'a.*z']).should.equal(true);
    });

    it('does not read stdin if process.stdin is a TTY', () => {
      process.stdin.isTTY = true;
      shouldReadStdin(['cat']).should.equal(false);
      shouldReadStdin(['head']).should.equal(false);
      shouldReadStdin(['sed', 's/foo/bar/g']).should.equal(false);
      shouldReadStdin(['grep', 'a.*z']).should.equal(false);
    });

    it('does not read stdin if command does not accept stdin', () => {
      process.stdin.isTTY = undefined;
      // It shouldn't matter for this function if these have valid numbers of
      // arguments or not, so let's test both
      shouldReadStdin(['rm']).should.equal(false);
      shouldReadStdin(['ls', 'dir']).should.equal(false);
      shouldReadStdin(['cp', 'a']).should.equal(false);
    });

    it('does not read stdin if files are given as arguments', () => {
      process.stdin.isTTY = undefined;
      shouldReadStdin(['cat', 'file.txt']).should.equal(false);
      shouldReadStdin(['head', 'file.txt']).should.equal(false);
      shouldReadStdin(['sed', 's/foo/bar/g', 'file.txt']).should.equal(false);
      shouldReadStdin(['grep', 'a.*z', 'file.txt']).should.equal(false);
      // Lots of files
      shouldReadStdin(['cat', 'file.txt', 'file2.txt', 'file3.txt'])
        .should.equal(false);
    });

    it('does not read stdin if both options and files are given', () => {
      process.stdin.isTTY = undefined;
      shouldReadStdin(['head', '-n', '1', 'file.txt']).should.equal(false);
      shouldReadStdin(['sed', '-i', 's/foo/bar/g', 'file.txt'])
        .should.equal(false);
      shouldReadStdin(['grep', '-i', 'a.*z', 'file.txt']).should.equal(false);
    });
  });

  describe('plugin', () => {
    afterEach(() => {
      shell.rm('-f', CONFIG_FILE);
      const CONFIG_PATH = path.join(process.cwd(), CONFIG_FILE);
      delete require.cache[require.resolve(CONFIG_PATH)];
    });

    it('throws exception for missing plugins', () => {
      const config = {
        plugins: [
          'shelljs-plugin-fake',
        ],
      };
      shell.ShellString(JSON.stringify(config)).to(CONFIG_FILE);

      (() => {
        cli('ls');
      }).should.throw(Error);
    });

    it('defends against malicious config files', () => {
      const notValidJSON = `
      var shell = require('shelljs');
      shell.rm('-rf', 'myPreciousFile.txt');
      module.export = {};
      `;
      shell.ShellString(notValidJSON).to(CONFIG_FILE);

      (() => {
        cli('ls');
      }).should.throw(Error);
    });

    it('adds plugin commands to the help files', () => {
      const config = {
        plugins: [
          'shelljs-plugin-open',
        ],
      };
      shell.ShellString(JSON.stringify(config)).to(CONFIG_FILE);

      const output = cli('help');
      output.stderr.should.equal('');
      output.stdout.should.match(/Usage/); // make sure help is printed
      output.stdout.should.match(/- open/); // help should include new command
    });
  });

  describe('ls', () => {
    beforeEach(() => {
      shell.mkdir('empty');
      shell.mkdir('not-empty');
      shell.touch('not-empty/file1.txt');
      shell.touch('not-empty/file2.txt');
    });

    afterEach(() => {
      shell.rm('-rf', 'empty');
      shell.rm('-rf', 'not-empty');
    });

    it('works with an empty directory', () => {
      const output = cli('ls', 'empty');
      output.stdout.should.equal('');
    });

    it('works with a non-empty directory', () => {
      const output = cli('ls', 'not-empty');
      output.stdout.should.equal('file1.txt\nfile2.txt\n');
    });
  });

  describe('sed', () => {
    const testFileName1 = 'foo.txt';
    const testFileName2 = 's/weirdfile/name/g';
    const testFileName3 = 'urls.txt';
    beforeEach(() => {
      // create test files
      shell.touch(testFileName1);
      shell.ShellString('foo\nfoosomething\nfoofoosomething\n')
        .to(testFileName1);

      shell.mkdir('-p', 's/weirdfile/name');
      shell.touch(testFileName2);
      shell.ShellString('foo\nfoosomething\nfoofoosomething\n')
        .to(testFileName2);

      shell.touch(testFileName3);
      shell.ShellString('http://www.nochange.com\nhttp://www.google.com\n')
        .to(testFileName3);
    });

    afterEach(() => {
      shell.rm('-f', testFileName1);
      shell.rm('-rf', 's/'); // For testFileName2
      shell.rm('-f', testFileName3);
    });

    it('works with no /g and no -i', () => {
      const output = cli('sed', 's/foo/bar/', testFileName1);
      output.stdout.should.equal('bar\nbarsomething\nbarfoosomething\n');
      shell.cat(testFileName1).stdout.should
        .equal('foo\nfoosomething\nfoofoosomething\n');
    });

    it('works with /g and -i', () => {
      const output = cli('sed', '-i', 's/foo/bar/g', testFileName1);
      output.stdout.should.equal('bar\nbarsomething\nbarbarsomething\n');
      shell.cat(testFileName1).stdout.should
        .equal('bar\nbarsomething\nbarbarsomething\n');
    });

    it('works with regexes conatining slashes', () => {
      const output = cli(
        'sed',
        's/http:\\/\\/www\\.google\\.com/https:\\/\\/www\\.facebook\\.com/',
        testFileName3
      );
      output.stdout.should
        .equal('http://www.nochange.com\nhttps://www.facebook.com\n');
      shell.cat(testFileName3).stdout.should
        .equal('http://www.nochange.com\nhttp://www.google.com\n');
    });

    it('works with empty replacement strings (with /g)', () => {
      const output = cli('sed', 's/foo//g', testFileName1);
      output.stdout.should
        .equal('\nsomething\nsomething\n');
    });

    it('works with empty replacement strings (without /g)', () => {
      const output = cli('sed', 's/foo//', testFileName1);
      output.stdout.should
        .equal('\nsomething\nfoosomething\n');
    });

    it('works with weird file names', () => {
      const output = cli('sed', 's/foo/bar/', testFileName2);
      output.stdout.should.equal('bar\nbarsomething\nbarfoosomething\n');
      shell.cat(testFileName2).stdout.should
        .equal('foo\nfoosomething\nfoofoosomething\n');
    });
  });

  describe('grep', () => {
    const testFileName = 'file.txt';
    beforeEach(() => {
      shell.touch(testFileName);
      shell.ShellString('1st line\nfoo\nf\ndoes not match\nsomething foo\n')
        .to(testFileName);
    });
    afterEach(() => {
      shell.rm('-f', testFileName);
    });
    it('works with regex syntax', () => {
      const ret = cli('grep', 'fo*', testFileName);
      ret.stdout.should.equal('foo\nf\nsomething foo\n');
    });
  });

  describe('chmod', () => {
    const testFileName = 'file.txt';
    const bitMask = parseInt('777', 8);
    beforeEach(() => {
      shell.touch(testFileName);
    });
    afterEach(() => {
      shell.rm('-f', testFileName);
    });
    skipIf(process.platform === 'win32', 'works with numeric mode', () => {
      // bitmasking is to ignore the upper bits
      cli('chmod', '644', testFileName);
      (fs.statSync(testFileName).mode & bitMask).should
        .equal(parseInt('644', 8));
      cli('chmod', '755', testFileName);
      (fs.statSync(testFileName).mode & bitMask).should
        .equal(parseInt('755', 8));
    });
    skipIf(process.platform === 'win32', 'works with symbolic mode (all)', () => {
      // bitmasking is to ignore the upper bits
      cli('chmod', '644', testFileName);
      (fs.statSync(testFileName).mode & bitMask).should.equal(parseInt('644', 8));
      cli('chmod', '+x', testFileName);
      (fs.statSync(testFileName).mode & bitMask).should.equal(parseInt('755', 8));
    });
    skipIf(process.platform === 'win32', 'works with symbolic mode (user only)', () => {
      cli('chmod', '644', testFileName);
      (fs.statSync(testFileName).mode & bitMask).should.equal(parseInt('644', 8));
      cli('chmod', 'u+x', testFileName);
      (fs.statSync(testFileName).mode & bitMask).should.equal(parseInt('744', 8));
    });
  });
});
