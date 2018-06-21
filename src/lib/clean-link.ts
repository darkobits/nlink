import path from 'path';

import execa from 'execa';
import fs from 'fs-extra';
import pkgDir from 'pkg-dir';
import rimraf from 'rimraf';

import createSymlink from 'lib/create-symlink';
import log from 'lib/log';
import parsePackageName from 'lib/parse-package-name';


/**
 * Replacement for 'npm link' that creates an output directory that only
 * contains files essential for the package to run, rather than linking the
 * entire project directory.
 *
 * - package.json
 * - node_modules
 *
 * Returns the path to the link directory, to which the user should write their
 * build artifacts.
 */
export default function link(): string {
  // Get the directory to which NPM links packages.
  const NPM_PREFIX = execa.shellSync('npm prefix -g').stdout;

  // Compute the root directory of the current package.
  const PKG_ROOT = pkgDir.sync();

  if (!PKG_ROOT) {
    throw new Error('Unable to locate the package\'s root directory.');
  }

  // Compute the path to the current package's package.json.
  const PKG_JSON_PATH = path.resolve(PKG_ROOT, 'package.json');

  const PKG_JSON = JSON.parse(fs.readFileSync(PKG_JSON_PATH, {encoding: 'utf8'}));

  if (!PKG_JSON.name) {
    throw new Error('Package must have a "name" field to be linked.');
  }

  // Compute the absolute path to where NPM would normally link this package.
  const NPM_LINK_DIR = path.resolve(NPM_PREFIX, 'lib', 'node_modules', PKG_JSON.name);
  log.verbose('target', NPM_LINK_DIR);


  // ----- Prepare Link Directory ----------------------------------------------

  // Ensure the link directory exists, and then remove all of its contents.
  log.verbose('dir', `Ensuring "${NPM_LINK_DIR}" exists.`);
  fs.ensureDirSync(NPM_LINK_DIR);

  log.verbose('rimraf', `Removing contents of "${NPM_LINK_DIR}".`);
  rimraf.sync(`${NPM_LINK_DIR}/**`);


  // ----- Symlink Package Manifest --------------------------------------------

  const PKG_JSON_TARGET = path.resolve(NPM_LINK_DIR, 'package.json');
  createSymlink(PKG_JSON_PATH, PKG_JSON_TARGET, 'file');


  // ----- Symlink Dependencies ------------------------------------------------

  if (PKG_JSON.dependencies) {
    // Only link the project's "dependencies"; "devDependencies" are not needed.
    Object.keys(PKG_JSON.dependencies).forEach((dependency: string) => {
      const DEPENDENCY_PATH = path.resolve(PKG_ROOT, 'node_modules', dependency);
      const DEPENDENCY_TARGET = path.resolve(NPM_LINK_DIR, 'node_modules', dependency);
      createSymlink(DEPENDENCY_PATH, DEPENDENCY_TARGET, 'dir');
    });
  }


  // ----- Symlink Binaries ----------------------------------------------------

  if (PKG_JSON.bin) {
    if (typeof PKG_JSON.bin === 'string') {
      // Handle cases where the package defines a single binary by symlinking
      // <NPM prefix>/bin/<package name> to the value specified.
      let parsedName: string;

      // In cases where the package name is scoped (ie: '@scope/package-name'),
      // extract the part after the scope (ie: 'package-name').
      const parseResult = parsePackageName(PKG_JSON.name);

      if (parseResult && parseResult.name) {
        parsedName = parseResult.name;
      } else {
        throw new Error(`Invalid package name: "${PKG_JSON.name}"`);
      }

      const BIN_PATH = path.resolve(NPM_LINK_DIR, PKG_JSON.bin);
      const BIN_TARGET = path.resolve(NPM_PREFIX, 'bin', parsedName);
      createSymlink(BIN_PATH, BIN_TARGET, 'file');
    } else if (typeof PKG_JSON.bin === 'object') {
      // Handle cases where the package defines multiple binaries by
      // symlinking <NPM prefix>/bin/<key> to each <value>.
      Object.entries(PKG_JSON.bin).forEach(([binaryName, binaryPath]: [string, string]) => {
        const BIN_PATH = path.resolve(NPM_LINK_DIR, binaryPath);
        const BIN_TARGET = path.resolve(NPM_PREFIX, 'bin', binaryName);
        createSymlink(BIN_PATH, BIN_TARGET, 'file');
      });
    } else {
      throw new Error(`Expected type of "bin" field to be "string" or "object", got "${typeof PKG_JSON.bin}".`);
    }
  }

  return NPM_LINK_DIR;
}
