// ['foo', 'bar;baz;quz', 'qux'] => [['foo', 'bar'], ['baz'], ['quz'], ['qux']]
function _parseArgs(args) {
  var cmds = [[]]; // An array of commands to run, each command is an array of [cmd, ...args]
  for (var i = 0; i < args.length; ++i) {
    var parts = args[i].split(';'); // You're allowed to separate commands with semicolons.
    cmds[0].push(parts.shift().trim()); // Add the first thing in the array to the current command
    if (parts.length !== 0) { // If there was >0 semicolons, then...
      cmds.unshift([]); // Start a new command
      args[i] = parts.join(';'); // Try it again, without the part we just handled.
      --i;
    }
  }
  // We store the commands in reverse order so that we can get the current one with cmds[0],
  // so reverse them before returning it.
  return cmds.reverse();
}

module.exports = _parseArgs;
