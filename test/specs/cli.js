import * as shxModule from '../../src/shx';

const shx = sandbox.spy(shxModule, 'shx');

// Run the cli with args as argv
const cli = (...args) => {
  const oldArgv = process.argv;     // store original argv
  process.argv = ['', '', ...args]; // mock argv
  sandbox.stub(process, 'exit');    // prevent cli from exiting test process

  require('../../src/cli');         // run cli

  process.exit.restore();           // restore stuff
  process.argv = oldArgv;
};

describe('cli', () => {
  it('calls shx', () => {
    shx.should.have.not.been.called();
    cli('echo');
    shx.should.have.been.called();
  });
});
