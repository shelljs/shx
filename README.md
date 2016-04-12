Shx
===

[![Build Status](https://travis-ci.org/shelljs/shx.svg?branch=master)](https://travis-ci.org/shelljs/shx)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/v3637gm5ftc72ms4?svg=true)](https://ci.appveyor.com/project/ariporad/shx)


`shx` is a wrapper around [ShellJS](https://github.com/shelljs/shelljs) unix
commands. We provide an easy solution to get simple unix-like commands in npm
package build steps in a cross-platform way.

Example
-------

The following code can be run on *either Unix or Windows* systems:

```Bash
$ shx pwd
/home/username/path/to/dir
$ shx ls
[ 'file.txt', 'file2.txt' ]
$ shx rm *.txt
$ shx ls
[]
$ shx touch helloworld.txt
$ shx ls
helloworld.txt
```

All commands internally call the ShellJS equivalent, guaranteeing you
cross-platform compatibility (so this is great for npm packages!).

Advantages over ShellJS
-----------------------

ShellJS is good for writing long scripts. If you want to write bash-like,
platform independent scripts, we recommend you go with that. However, if you only need to execute an `rm` command or two, or run `cp`, then this eliminates the need to write an entire script.

Writing a one-liner like:

```
shx rm foo.txt
```

is a lot less verbose than writing a file containing:

```Javascript
// Inside scripts/scriptname.js
require('shelljs/global');
rm('foo.txt');
```

And then calling it with `node scripts/scriptname.js`

## Team

| [![Nate Fischer](https://avatars.githubusercontent.com/u/5801521?s=130)](https://github.com/nfischer) | [![Ari Porad](https://avatars1.githubusercontent.com/u/1817508?v=3&s=130)](http://github.com/ariporad) | [![Levi Thomason](https://avatars1.githubusercontent.com/u/5067638?v=3&s=130)](https://github.com/levithomason) |
|:---:|:---:|:---:|
| [Nate Fischer](https://github.com/nfischer) | [Ari Porad](http://github.com/ariporad) | [Levi Thomason](https://github.com/levithomason) |
