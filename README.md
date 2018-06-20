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

# Install

```
npm install --save-dev @darkobits/clean-link
```

Then, use the `clean-link-dir` script anywhere in your package scripts. See below for an example.

# Use

[`npm link`](https://docs.npmjs.com/cli/link) is a handy utility for developing libraries / frameworks / tooling and ensuring they work with their dependents.

Given a hypothetical library, **foo-lib**, and a hypothetical dependent, **bar-app**, a common workflow involves something like the following:

1. Run `npm link` from the **foo-lib** project folder.
2. Start **foo-lib**'s build script in watch mode.
3. Run `npm link foo-lib` from the **bar-app** project folder.
4. Make changes to **foo-lib**'s source.
5. Verify these changes didn't break anything in **bar-app**.
6. ????
6. Profit!! 💰

This nice workflow can get a little wonky under certain circumstances, however. Consider the following case:

- **bar-app** is compiled with Babel 6.x.
- **foo-lib** is compiled with Babel 7.x.
- **foo-lib** is `npm link`-ed into **bar-app**.

If you try to run **bar-app**, you will get the following error:

```
Error: Requires Babel "^7.x.x", but was loaded with "6.x.x". If you are sure you
have a compatible version of @babel/core, it is likely that something in your
build process is loading the wrong version. Inspect the stack trace of this
error to look for the first entry that doesn't mention "@babel/core" or
"babel-core" to see what is calling Babel.
```

That's definitely a [bad-time][bad-time-url], mate. What's going on here? We don't need the files for **foo-lib** transpiled, they already have been!

This is happening because the copy of Babel in **bar-app** can see the `.babelrc` file in **foo-lib** because NPM symlinks the _entire project folder_ into **bar-app**'s `node_modules`. If we published **foo-lib** in its current state and `npm install`-ed it in **bar-app** normally, we would not encounter this and similar kinds of errors.

And, because Babel has [a bug](https://github.com/babel/babel/issues/5532) with `ignore`, we can't simply `--ignore=node_modules` from **bar-app**. What we really want is to *hide* **foo-lib**'s `.babelrc` (and everything else that would not be included in a distribution) from **bar-app**, because developing in an environment that is as close as possible to production `===` 👍.

That's what `clean-link` does. Instead of symlink-ing your entire project, it only symlinks `package.json`, `node_modules` , and any `bin` files your project may specify. Then, it returns the path to this nice, clean workspace which you can then write your build artifacts to. In practice, that might look something like this:

```js
{
  "name": "foo-lib",
  "version": "1.0.0",
  "files": [
    "dist"
  ],
  "main": "dist/index.js",
  "scripts": {
    // Our normal build script writes files to 'dist'.
    "build": "babel src --out-dir=dist",
    // 'npm run link' will write files to something like '/usr/local/lib/node_modules/foo-lib/dist'
    // and update it when we make changes.
    "link": "npm run build -- --out-dir=$(npx clean-link-dir)/dist --watch"
  }
  // etc...
}
```

Now, when we run `npm link foo-lib` from **bar-app**, we only get the files we need, and everything is copacetic. 🕶

## Debugging

This package respects the `LOG_LEVEL` environment variable, and uses the standard [NPM log levels](https://github.com/npm/npmlog#loglevelprefix-message-). For more verbose output, try `LOG_LEVEL=verbose npm run <script that uses clean-link-dir>`.

<br>

<p align="center">
  <img src="https://user-images.githubusercontent.com/441546/41495073-e120a3cc-70d3-11e8-81da-35f59501cd0e.jpg" width="250">
</p>

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[bad-time-url]: http://1.images.southparkstudios.com/images/shows/south-park/clip-thumbnails/season-6/0603/south-park-s06e03c03-thumper-the-super-cool-ski-instructor-16x9.jpg?quality=1
