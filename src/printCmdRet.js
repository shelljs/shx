// This function takes the raw result of a shelljs command and figures out how to print it.
// Invoke this *REGARDLESS* of what the command returns, it will figure it out.
export const printCmdRet = (ret) => {
  if (!ret) return;
  if (typeof ret === 'boolean') return; // don't print this

  if (typeof ret.stdout === 'string') {
    process.stdout.write(ret.stdout);
  } else if (Array.isArray(ret)) {
    process.stdout.write(ret.join('\n'));
    if (ret.length > 0)
      console.log(); // an extra newline
  } else {
    process.stdout.write(ret);
  }
};
