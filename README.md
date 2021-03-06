<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/102331985-5b784e80-3f40-11eb-864c-1a8b6e00353b.png" style="max-width: 100%;">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/nlink"><img src="https://img.shields.io/npm/v/@darkobits/nlink.svg?style=flat-square"></a>
  <a href="https://github.com/darkobits/nlink/actions?query=workflow%3ACI"><img src="https://img.shields.io/github/workflow/status/darkobits/nlink/CI/master?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/nlink"><img src="https://img.shields.io/david/darkobits/nlink.svg?style=flat-square"></a>
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
</p>

This tool is intended to be a suppliment to `npm link` in certain exotic cases where `npm link` doesn't do exactly what you want it to do.

It is especially useful for local development in large monorepos.

# Install

```
npm install --save-dev @darkobits/nlink
```

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

This creates a more "production-like" environment for the linked package, which helps to avoid issues that can sometimes arise when the entire project's source folder is linked.

To create a linkable package, but skip linking binaries:

```
nlink --bin=false
```

These behaviors are configurable. For a full list of options, see `--help`.

### `nlink <packageOrPattern>`

Like `npm link <package name>`, but supports globbing to link several packages at once.

Patterns are matched against the contents of `package-lock.json`. If the project does not have a `package-lock.json`, or if the provided input does not match any dependencies therein, `nlink` will fall-back to treating the input as an explicit package name. In this case, if the input is a [valid NPM package name](https://github.com/npm/validate-npm-package-name), `nlink` will attempt to link to it. If an invalid name or glob pattern was provided, `nlink` will abort.

Because `nlink` matches against a project's lockfile, it is possible to link to [transitive dependencies](https://lexi-lambda.github.io/blog/2016/08/24/understanding-the-npm-dependency-model/).

**Note:** This command uses [`minimatch`](https://github.com/isaacs/minimatch) under the hood, which was designed to work primarily with filesystems. Therefore, treat scoped packages like a directory structure.

For example, to match all `@babel`-scoped packages, you will need a globstar:

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

This package respects the `LOG_LEVEL` environment variable, and uses the standard [NPM log levels](https://github.com/npm/npmlog#loglevelprefix-message-). For more verbose output, try `LOG_LEVEL=silly nlink ...`.

Additionally, you may pass `--dry-run` to either form of the command, which will automatically enable more verbose logging.

## &nbsp;
<br />
<p align="center">
  <img src="https://user-images.githubusercontent.com/441546/41495073-e120a3cc-70d3-11e8-81da-35f59501cd0e.jpg" width="250"><br>
  Happy linking!
</p>

<br />
<a href="#top">
  <img src="https://user-images.githubusercontent.com/441546/102322726-5e6d4200-3f34-11eb-89f2-c31624ab7488.png" style="max-width: 100%;">
</a>
