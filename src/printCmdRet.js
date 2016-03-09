// This function takes the raw result of a shelljs command and figures out how to print it.
// Invoke this *REGARDLESS* of what the command returns, it will figure it out.
function printCmdRet(ret) {
  // This is way to complicated. It should get much easier once shelljs/shelljs#356 is fixed.
  if (ret) {
    if (typeof ret.stdout !== 'undefined' && typeof ret.stderr !== 'undefined') {
      if (ret.stdout) console.log(ret.stdout);
      if (ret.stderr) console.error(ret.stderr);
    } else if (ret.output) {
      console.log(ret.output);
    } else if (Array.isArray(ret)) {
      console.log(ret.join('\n'));
    } else {
      console.log(ret);
    }
  }
}

module.exports = printCmdRet;
