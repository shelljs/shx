# Shx

[![Travis](https://img.shields.io/travis/shelljs/shx.svg)](https://travis-ci.org/shelljs/shx)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/v3637gm5ftc72ms4/branch/master?svg=true)](https://ci.appveyor.com/project/ariporad/shx/branch/master)

`shx` is a wrapper around [ShellJS](https://github.com/shelljs/shelljs) Unix
commands, providing an easy solution for simple Unix-like, cross-platform
commands in npm package scripts.

## Example

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
```

All commands internally call the ShellJS corresponding function, guaranteeing
cross-platform compatibility.

## Advantages over ShellJS

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
