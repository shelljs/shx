# Plugin support

Did you know that `shx` can also take advantage of all the great
[ShellJS plugins](https://www.npmjs.com/search?q=keyword%3Ashelljs%2Cplugin)?
Here's how to get started using plugins with your project:

## Using plugins from inside package.json scripts

```shell
$ npm install --save-dev shx
$ npm install --save-dev shelljs-plugin-sleep
```

Define a file named `.shxrc.json` to tell `shx` which plugins to load:

```json
{
  "plugins": [
    "shelljs-plugin-sleep"
  ]
}
```

Define a script in package.json which invokes the desired `shx` plugin as a
command:

```json5
{
  // Your other package.json stuff goes here...
  "scripts": {
    "my-cool-script": "echo 'sleep for 3 seconds' && shx sleep 3"
  }
  // ...
}
```

And now you can run your package.json script:

```shell
$ npm run my-cool-script
```

**Important:** make sure you execute this via the `npm run` script, do not try
to call `shx` directly from your terminal. If you call `shx` directly in the
terminal, then `shx` won't be able to import the plugins from your local
`node_modules/` directory. Calling this via `npm run` script fixes the problem
because `npm` automatically adds `node_modules/` to the import path.

**Note:** `shx` will only load plugins if a `.shxrc.json` file is present in the
working directory, so it's recommended to add this JSON file to the top level of
your project, right next to your project's package.json file.
