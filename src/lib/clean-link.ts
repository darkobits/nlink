import path from 'path';

import convertHrtime from 'convert-hrtime';
import del from 'del';
import execa from 'execa';
import fs from 'fs-extra';
import pkgDir from 'pkg-dir';

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
  // Mark start time.
  const startTime = process.hrtime();

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
  log.info('dir', `Creating "${NPM_LINK_DIR}".`);
  fs.ensureDirSync(NPM_LINK_DIR);

  log.verbose('del', `Removing non-dependency contents of "${NPM_LINK_DIR}".`);
  del.sync([`${NPM_LINK_DIR}/*`, `!${NPM_LINK_DIR}/node_modules`], {
    // This is necessary in order to remove files outside of the current working
    // directory.
    force: true
  });


  // ----- Symlink Package Manifest --------------------------------------------

  const PKG_JSON_TARGET = path.resolve(NPM_LINK_DIR, 'package.json');
  log.info('pkg', 'Symlinking "package.json".');
  createSymlink(PKG_JSON_PATH, PKG_JSON_TARGET, 'file');


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
      log.info('bin', `Symlinking binary "${parsedName}".`);
      createSymlink(BIN_PATH, BIN_TARGET, 'file');
    } else if (typeof PKG_JSON.bin === 'object') {
      // Handle cases where the package defines multiple binaries by
      // symlinking <NPM prefix>/bin/<key> to each <value>.
      Object.entries(PKG_JSON.bin).forEach(([binaryName, binaryPath]: [string, string]) => {
        const BIN_PATH = path.resolve(NPM_LINK_DIR, binaryPath);
        const BIN_TARGET = path.resolve(NPM_PREFIX, 'bin', binaryName);
        log.info('bin', `Symlinking binary "${binaryName}".`);
        createSymlink(BIN_PATH, BIN_TARGET, 'file');
      });
    } else {
      throw new Error(`Expected type of "bin" field to be "string" or "object", got "${typeof PKG_JSON.bin}".`);
    }
  }


  // ----- Install Dependencies ------------------------------------------------

  if (PKG_JSON.dependencies) {
    /**
     * This has been disabled until https://github.com/npm/npm/issues/13528 is
     * resolved.
     */

    // const PKG_LOCK_PATH = path.resolve(PKG_ROOT, 'package-lock.json');

    // if (fs.pathExistsSync(PKG_LOCK_PATH)) {
    //   const PKG_LOCK_TARGET = path.resolve(NPM_LINK_DIR, 'package-lock.json');
    //   log.info('pkg', 'Symlinking "package-lock.json".');
    //   createSymlink(PKG_LOCK_PATH, PKG_LOCK_TARGET, 'file');
    // }

    log.info('dep', 'Installing dependencies.');
    execa.shellSync('npm install --production --no-audit', {
      stdio: ['ignore', 'ignore', log.level === 'verbose' ? 'inherit' : 'ignore'],
      cwd: NPM_LINK_DIR
    });
  }

  const prepTime = convertHrtime(process.hrtime(startTime)).seconds;
  log.info('prep', `Done in ${prepTime.toFixed(2)}s.`);

  return NPM_LINK_DIR;
}
