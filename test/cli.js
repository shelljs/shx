import test from 'ava';
import sinon from 'sinon';

import * as shxModule from '../src/shx';

const sandbox = sinon.sandbox.create();
const shx = sandbox.spy(shxModule, 'shx');

// Run the cli with args as argv
const cli = (...args) => {
  const oldArgv = process.argv;     // store original argv
  process.argv = ['', '', ...args]; // mock argv
  sandbox.stub(process, 'exit');    // prevent cli from exiting test process

  require('../src/cli');            // run cli

  process.exit.restore();           // restore stuff
  process.argv = oldArgv;
};

test.afterEach(() => {
  sandbox.restore();
});

test('calls shx', t => {
  t.false(shx.called);
  cli('echo');
  t.true(shx.called);
});
