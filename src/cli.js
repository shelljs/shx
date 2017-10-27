#!/usr/bin/env node
import { shx } from './shx';
import minimist from 'minimist';
import { shouldReadStdin } from './config';

const parsedArgs = minimist(process.argv.slice(2), { stopEarly: true, boolean: true });

// `input` is null if we're running from a TTY, or a string of all stdin if
// running from the right-hand side of a pipe
const run = (input) => {
  // Pass stdin to shx as the 'this' parameter
  process.exitCode = shx.call(input, process.argv);

  // We use process.exitCode to ensure we don't terminate the process before
  // streams finish. See:
  //   https://github.com/shelljs/shx/issues/85
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
