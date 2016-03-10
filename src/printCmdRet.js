// This function takes the raw result of a shelljs command and figures out how to print it.
// Invoke this *REGARDLESS* of what the command returns, it will figure it out.
export const printCmdRet = (ret) => {
  if (!ret) return;

  // This is way to complicated. It should get much easier once shelljs/shelljs#356 is fixed.
  if (ret.stdout && ret.stderr) {
    if (ret.stdout) console.log(ret.stdout);
    if (ret.stderr) console.error(ret.stderr);
  } else if (ret.output) {
    console.log(ret.output);
  } else if (Array.isArray(ret)) {
    console.log(ret.join('\n'));
  } else {
    console.log(ret);
  }
};
