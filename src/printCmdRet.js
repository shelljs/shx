// This function takes the raw result of a shelljs command and figures out how to print it.
// Invoke this *REGARDLESS* of what the command returns, it will figure it out.
exports.printCmdRet = (ret) => {
  // Don't print these types
  if (typeof ret === 'boolean' || !ret) return;

  if (typeof ret.stdout === 'string') {
    process.stdout.write(ret.stdout);
  } else {
    process.stdout.write(ret);
  }
};
