import os from 'os';
import path from 'path';

import execa from 'execa';
import fs from 'fs-extra';
import readPkgUp from 'read-pkg-up';

import {NpmLinkPaths} from '../etc/types';


/**
 * Returns the platform-dependent path prefix NPM uses when linking packages.
 *
 * On POXIS systems, this is something like: "/usr/local"
 * On Windows, this is something like: "C:\Users\<username>\AppData\Roaming\npm"
 *
 * This is configurable by the user, so it should always be obtained
 * programatically.
 */
export function getNpmPathPrefix() {
  return execa.shellSync('npm prefix -g').stdout;
}


/**
 * Returns the platform-dependent path segment following the prefix that NPM
 * uses when linking packages.
 */
export function getIntermediateLinkPathSegment() {
  switch (os.platform()) {
    case 'win32':
      return '';
    default:
      return 'lib';
  }
}


/**
 * Returns the platform-dependent path segment following the prefix that NPM
 * uses when linking package binaries.
 */
export function getIntermediateBinPathSegment() {
  switch (os.platform()) {
    case 'win32':
      return '';
    default:
      return 'bin';
  }
}


/**
 * Provided a path (optional), walks up the directory tree until a package.json
 * is found, then returns an object describing where 'npm link' would normally
 * create symlinks for that package and its binaries.
 */
export function getNpmLinkPaths(cwd: string = process.cwd()): NpmLinkPaths {
  // This function calls-out to a shell, so only call it once.
  const npmPrefix = getNpmPathPrefix();

  const pkgIntermediatePath = getIntermediateLinkPathSegment();
  const binIntermediatePath = getIntermediateBinPathSegment();

  // Get information for the closest parent package relative to the corrent
  // working directory, or the provided directory.
  const meta = readPkgUp.sync({cwd});

  // The path property is the absolute path to the package.json file. We want
  // just the directory.
  const root = path.parse(meta.path).dir;

  const result: NpmLinkPaths = {
    pkg: {
      src: root,
      link: path.join(npmPrefix, pkgIntermediatePath, 'node_modules', meta.pkg.name)
    }
  };

  if (meta.pkg.bin) {
    result.bin = Object.entries(meta.pkg.bin).map(([binName, binPath]) => ({
      src: path.join(root, binPath),
      link: path.join(npmPrefix, binIntermediatePath, binName)
    }));
  }

  return result;
}


/**
 * Provided a path, returns an object indicating whether a file/directory exists
 * at that location, if it is a symlink and, if so, what the link points to.
 */
export function introspectPath(str: string) {
  const results = {
    exists: false,
    isSymbolicLink: false,
    realPath: ''
  };

  try {
    // This will throw if the file doesn't exist or cannot be accessed.
    fs.accessSync(str);

    results.exists = true;

    const realPath = fs.realpathSync(str);

    if (realPath !== str) {
      results.isSymbolicLink = true;
      results.realPath = realPath;
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  return results;
}
