import os from 'os';
import path from 'path';

import {ExecaWrapper} from '@darkobits/chex';
import findUp from 'find-up';
import fs from 'fs-extra';
import readPkgUp from 'read-pkg-up';
import validateNpmPackageName from 'validate-npm-package-name';

import {NpmLinkPaths} from 'etc/types';


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
export function getNpmLinkPaths(npm: ExecaWrapper, cwd: string = process.cwd()): NpmLinkPaths {
  // This function calls-out to a shell, so only call it once.
  const npmPrefix = npm.sync(['prefix', '-g']).stdout;

  const pkgIntermediatePath = getIntermediateLinkPathSegment();
  const binIntermediatePath = getIntermediateBinPathSegment();

  // Get information for the closest parent package relative to the current
  // working directory, or the provided directory.
  const meta = readPkgUp.sync({cwd});

  if (!meta) {
    throw new Error(`Unable to find a package.json. from "${cwd}"`);
  }

  // The path property is the absolute path to the package.json file. We want
  // just the directory.
  const root = path.parse(meta.path).dir;

  const result: NpmLinkPaths = {
    package: {
      src: root,
      link: path.join(npmPrefix, pkgIntermediatePath, 'node_modules', meta.packageJson.name)
    }
  };

  if (meta.packageJson.bin) {
    result.bin = Object.entries(meta.packageJson.bin).map(([binName, binPath]) => ({
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


/**
 * Provided a string, returns true if the string is a valid NPM package name.
 */
export function isValidPackageName(name: string): boolean {
  return validateNpmPackageName(name).validForNewPackages;
}


/**
 * Returns a flat list of all dependencies found in a project's
 * package-lock.json.
 */
export function getDependenciesFromLockfile(cwd: string = process.cwd()): Array<string> {
  const lockfilePath = findUp.sync('package-lock.json', {cwd});

  if (!lockfilePath) {
    return [];
  }

  const {dependencies} = require(lockfilePath);

  return Object.keys(dependencies);
}
