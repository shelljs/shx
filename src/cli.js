#!/usr/bin/env node
import { shx } from './shx';

const code = shx(process.argv);

// Make sure output is flushed before exiting the process. Please see:
//  - https://github.com/shelljs/shx/issues/85
//  - https://github.com/mochajs/mocha/issues/333
let streamCount = 0;
const streams = [process.stdout, process.stderr];
streams.forEach(stream => {
  streamCount++; // count each stream
  stream.write('', () => {
    streamCount--; // mark each stream as finished
    if (streamCount === 0) process.exit(code);
  });
});
