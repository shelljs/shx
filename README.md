Shx
===

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

Installing from GitHub?
----------------------

If you are installing directly from GitHub, `npm install shelljs/shx`, you'll need to build `shx` locally.  This project does not commit built assets to the GitHub repo.  To build locally:

```
cd node_modules/shx
npm install
npm run build
```

You can ignore this section if you are installing from NPM `npm install shx`.  Built assets are included with the NPM package. (At the time of writing, we've not yet published to NPM).
