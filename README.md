<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/41494997-176796ea-70d2-11e8-85e3-14ee115fcb72.png">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/clean-link"><img src="https://img.shields.io/npm/v/@darkobits/clean-link.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/darkobits/clean-link"><img src="https://img.shields.io/travis/darkobits/clean-link.svg?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/clean-link"><img src="https://img.shields.io/david/darkobits/clean-link.svg?style=flat-square"></a>
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square"></a>
</p>

[`npm link`](https://docs.npmjs.com/cli/link) is a handy utility for developing libraries / frameworks / tooling and ensuring they work with their dependents.

Given a hypothetical library, **myLib**, and a hypothetical depdendent, **someDependent**, a common workflow involves something like the following:

1. Run `npm link` from the **myLib** project folder.
2. Start **myLib**'s build script in watch mode.
2. Run `npm link myLib` from the **someDependent** project folder.
4. Make changes to **myLib**'s source.
5. Verify these changes didn't break anything in **someDependent**.
6. Profit. 💰

This nice workflow can get a little wonky under certain circumstances, however. Consider the following case:

- **someDependent** is compiled with Babel 6.x.
- **myLib** is compiled with Babel 7.x.
- **myLib** is `npm link`-ed into **someDependent**.

If you try to run **someDependent**, you will get the following error:

```
Error: Requires Babel "^7.x.x", but was loaded with "6.x.x". If you are sure you
have a compatible version of @babel/core, it is likely that something in your
build process is loading the wrong version. Inspect the stack trace of this
error to look for the first entry that doesn't mention "@babel/core" or
"babel-core" to see what is calling Babel.
```

That's definitely a [bad-time][bad-time-url], mate. We don't even need the files for **myLib** transpiled; they already have been. And because Babel has [a bug](https://github.com/babel/babel/issues/5532) with `ignore`, there's not much that can be done to fix this.

What we really want is to hide **myLib**'s `.babelrc` (and really, everything that is _not_ a build artifact) from **someDependent**, just as would be the case if we had `npm install`-ed **myLib** normally.

That's what `clean-link` aims to do. Instead of symlinking your entire project, it only symlinks `package.json`, `node_modules` and your build artifacts folder (`dist` by default), the bare minimum needed by a dependent.

# Install

```
npm install --save-dev @darkobits/clean-link
```

# Use

`clean-link` may be used via a CLI or programatically.

## CLI

The easiest way to use `clean-link` is to add a script to your project's `package.json`:

```diff
{
  "scripts": {
    "build": "babel src --out-dir dist <etc>",
    "build:watch": "babel src --out-dir dist --watch",
+    "link": "clean-link"
  }
}
```

If you use Babel, and you have a script named `build` that builds your project, and your output folder is `dist`, you're done!

Otherwise, you may need to provide one or more arguments to `clean-link` to tell it how your project is built:

|Name|Default|Description|
|---|---|---|
|`--build-script`|`'build'`|Name of the [NPM script](https://docs.npmjs.com/cli/run-script) that builds your project.|
|`--watch-arg`|`'watch'`|Argument to pass to your project's build tool that enables watch mode.|
|`--out-dir-arg`|`'out-dir'`|Argument to pass to your project's build tool that indicates the output directory.|
|`--dist-dir`|`'dist'`|Location where your project's build artifacts are typically generated.|

These defaults are optimized for Babel, but could be adapted for any build tool that accepts similar argument types.

Now, just run `npm run link` instead of `npm link`, and start hacking!

<p align="center">
  <img src="https://user-images.githubusercontent.com/441546/41495073-e120a3cc-70d3-11e8-81da-35f59501cd0e.jpg" width="250">
</p>

## Programmatic Use

`clean-link` _can_ be used programatically, but if used as intended, it will start a long-running process and therefore will not return; the process is typically terminated by sending `SIGINT` (Ctrl + C on Unix-like systems).

```ts
import cleanLink from '@darkobits/clean-link';

// All command-line arguments are expected in camelCase when calling cleanLink directly:
cleanLink({
  buildScript: 'my-build-script',
  distDir: 'out'
});
```

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[bad-time-url]: http://1.images.southparkstudios.com/images/shows/south-park/clip-thumbnails/season-6/0603/south-park-s06e03c03-thumper-the-super-cool-ski-instructor-16x9.jpg?quality=1
