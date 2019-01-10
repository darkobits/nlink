<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/50995078-db831780-14d2-11e9-9076-d74a255b1400.png" style="max-width: 100%;">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/nlink"><img src="https://img.shields.io/npm/v/@darkobits/nlink.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/darkobits/nlink"><img src="https://img.shields.io/travis/darkobits/nlink.svg?style=flat-square"></a>
  <a href="https://www.codacy.com/app/darkobits/nlink"><img src="https://img.shields.io/codacy/coverage/0f633a69424344b49ecf5b045903f44b.svg?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/nlink"><img src="https://img.shields.io/david/darkobits/nlink.svg?style=flat-square"></a>
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square"></a>
</p>

This tool is intended to be a suppliment to `npm link` in certain exotic cases where `npm link` doesn't do exactly what you want it to do.

It is especially useful for local development in large monorepos.

# Install

```
npm install --save-dev @darkobits/nlink
```

Then, use the `nlink` command anywhere in your package scripts. See below for an example.

# Use

## CLI

`nlink` has the same API as [`npm link`](https://docs.npmjs.com/cli/link.html), which has two modes of operation:

### `nlink [options]`

Like `npm link`, this command should be run from a package you wish to link-to elsewhere.

Unlike `npm link`, which symlinks the entire package folder, `nlink` _creates_ a folder and then symlinks only the following items into it:

* `packge.json`
* `node_modules`
* Anything declared in `"files"` in `package.json`.
* Anything declared in `"bin"` in `package.json`.

These behaviors are configurable. See `--help` for CLI options.

### `nlink <packageOrPattern>`

Like `npm link <package name>`, but supports globbing to link several packages at once.

Note: This uses [`minimatch`](https://github.com/isaacs/minimatch) under the hood, which was designed to work primarily with filesystems. Therefore, treat scoped packages like a directory structure.

To match all `@babel`-scoped packages, you will need a globstar:

```
nlink '@babel/**'
```

To link `@babel/core` and any Babel plugins, but no other Babel packages:

```
nlink '@babel/{core,plugin*}'
```

## Node API

Both functions used by the CLI are available for programmatic use. Please refer to the source for specifics.

# Debugging

This package respects the `LOG_LEVEL` environment variable, and uses the standard [NPM log levels](https://github.com/npm/npmlog#loglevelprefix-message-). For more verbose output, try `LOG_LEVEL=verbose npm run <script that uses nlink-dir>`.

Additionally, you may pass `--dry-run` to either form of the command, which will automatically enable more verbose logging.

## &nbsp;

<p align="center">
  <img src="https://user-images.githubusercontent.com/441546/41495073-e120a3cc-70d3-11e8-81da-35f59501cd0e.jpg" width="250"><br>
  Happy linking!
</p>

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[bad-time-url]: http://1.images.southparkstudios.com/images/shows/south-park/clip-thumbnails/season-6/0603/south-park-s06e03c03-thumper-the-super-cool-ski-instructor-16x9.jpg?quality=1
