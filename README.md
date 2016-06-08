# Shx

[![Travis](https://img.shields.io/travis/shelljs/shx/master.svg?style=flat-square&label=unix)](https://travis-ci.org/shelljs/shx)
[![AppVeyor](https://img.shields.io/appveyor/ci/ariporad/shx/master.svg?style=flat-square&label=windows)](https://ci.appveyor.com/project/ariporad/shx/branch/master)
[![Codecov](https://img.shields.io/codecov/c/github/shelljs/shx/master.svg?style=flat-square&label=coverage)](https://codecov.io/gh/shelljs/shx)


`shx` is a wrapper around [ShellJS](https://github.com/shelljs/shelljs) Unix
commands, providing an easy solution for simple Unix-like, cross-platform
commands in npm package scripts.

## Install

```shell
npm install shx --save-dev
```
This will allow using `shx` in your `package.json` scripts.

## Usage

### Command Line

If you'd like to use `shx` on the command line, install it globally with the `-g` flag.
The following code can be run *either a Unix or Windows* command line:

```Bash
$ shx pwd                       # ShellJS commands are supported automatically
/home/username/path/to/dir

$ shx ls                        # files are outputted one per line
file.txt
file2.txt

$ shx rm *.txt                  # a cross-platform way to delete files!

$ shx ls

$ shx echo "Hi there!"
Hi there!

$ shx touch helloworld.txt

$ shx cp helloworld.txt foobar.txt

$ shx mkdir sub

$ shx ls
foobar.txt
helloworld.txt
sub

$ shx rm -r sub                 # options work as well

$ shx --silent ls fakeFileName  # silence error output
```

All commands internally call the ShellJS corresponding function, guaranteeing
cross-platform compatibility.

### package.json

ShellJS is good for writing long scripts. If you want to write bash-like,
platform-independent scripts, we recommend you go with that.

However, `shx` is ideal for one-liners inside `package.json`:

```javascript
{
  "scripts": {
    "clean": "shx rm -rf build dist && shx echo Done"
  }
}
```

## Team

| [![Nate Fischer](https://avatars.githubusercontent.com/u/5801521?s=130)](https://github.com/nfischer) | [![Ari Porad](https://avatars1.githubusercontent.com/u/1817508?v=3&s=130)](http://github.com/ariporad) | [![Levi Thomason](https://avatars1.githubusercontent.com/u/5067638?v=3&s=130)](https://github.com/levithomason) |
|:---:|:---:|:---:|
| [Nate Fischer](https://github.com/nfischer) | [Ari Porad](http://github.com/ariporad) | [Levi Thomason](https://github.com/levithomason) |
