import path from 'path';
import execa from 'execa';

// @ts-ignore
import fs from 'fs-extra';

import pkgDir from 'pkg-dir';

import {
  DEFAULT_BUILD_SCRIPT,
  DEFAULT_WATCH_ARG,
  DEFAULT_OUT_DIR_ARG,
  DEFAULT_DIST_DIR
} from 'etc/constants';

import {CleanLinkOptions} from 'etc/types';
import log from 'lib/log';


/**
 * Replacement for 'npm link' that creates an output directory that only
 * contains files essential for the package to run:
 *
 * - package.json
 * - node_modules
 * - The package's build artifacts directory.
 *
 * Using this approach, we avoid symlinking the entire project structure, which
 * can cause unexpected behavior.
 */
export default function link(userOptions: CleanLinkOptions): void {
  // Apply defaults.
  const options: CleanLinkOptions = {
    buildScript: DEFAULT_BUILD_SCRIPT,
    watchArg: DEFAULT_WATCH_ARG,
    outDirArg: DEFAULT_OUT_DIR_ARG,
    distDir: DEFAULT_DIST_DIR,
    ...userOptions
  };

  try {
    // Get the directory to which NPM links packages.
    const NPM_PREFIX = execa.shellSync('npm prefix -g').stdout;

    // Compute the root directory of the current package.
    const PKG_ROOT = pkgDir.sync();

    if (!PKG_ROOT) {
      throw new Error('Unable to locate the package\'s root directory.');
    }

    // Compute the path to the current package's package.json.
    const PKG_JSON_PATH = path.resolve(PKG_ROOT, 'package.json');

    // Get the name of the current package.
    const PKG_NAME = require(PKG_JSON_PATH).name;

    // Compute the absolute path to where NPM would normally link this package.
    const NPM_LINK_DIR = path.resolve(NPM_PREFIX, 'lib', 'node_modules', PKG_NAME);
    log.info('target', NPM_LINK_DIR);

    // Remove the link directory and re-create it.
    fs.removeSync(NPM_LINK_DIR);
    fs.ensureDirSync(NPM_LINK_DIR);

    // Symlink package.json into the link directory.
    const PKG_JSON_TARGET = path.resolve(NPM_LINK_DIR, 'package.json');
    log.verbose('symlink', `${PKG_JSON_TARGET} => ${PKG_JSON_PATH}`);
    fs.ensureSymlinkSync(PKG_JSON_PATH, PKG_JSON_TARGET);

    // Symlink node_modules into the link directory.
    const NODE_MODULES_PATH = path.resolve(PKG_ROOT, 'node_modules');
    const NODE_MODULES_TARGET = path.resolve(NPM_LINK_DIR, 'node_modules');
    log.verbose('symlink', `${NODE_MODULES_TARGET} => ${NODE_MODULES_PATH}`);
    fs.ensureSymlinkSync(NODE_MODULES_PATH, NODE_MODULES_TARGET);

    const DIST_TARGET = path.resolve(NPM_LINK_DIR, options.distDir);
    const BUILD_CMD = `npm run ${options.buildScript} -- --${options.watchArg} --${options.outDirArg}=${DIST_TARGET}`;
    log.verbose('build cmd', BUILD_CMD);

    execa.shellSync(BUILD_CMD, {stdio: 'inherit'});
  } catch (err) {
    log.error('', err.stack);
    process.exit(1);
  }
}
