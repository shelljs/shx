#!/usr/bin/env node
import { shx } from './shx';
import minimist from 'minimist';
import { shouldReadStdin } from './config';

const parsedArgs = minimist(process.argv.slice(2), { stopEarly: true, boolean: true });

// `input` is null if we're running from a TTY, or a string of all stdin if
// running from the right-hand side of a pipe
const run = (input) => {
  // Pass stdin to shx as the 'this' parameter
  const code = shx.call(input, process.argv);

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
};

// ShellJS doesn't support input streams, so we have to collect all input first
if (shouldReadStdin(parsedArgs._)) {
  // Read all stdin first, and then pass that onto ShellJS
  const chunks = [];
  process.stdin.on('data', data => chunks.push(data));
  process.stdin.on('end', () => run(chunks.join('')));
} else {
  // There's no stdin, so we can immediately invoke the ShellJS function
  run(null);
}
