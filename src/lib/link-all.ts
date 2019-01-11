import chalk from 'chalk';
import execa from 'execa';
import findUp from 'find-up';
import minimatch from 'minimatch';
// @ts-ignore
import validateNpmPackageName from 'validate-npm-package-name';

import log from 'lib/log';


/**
 * Returns a flat list of all dependencies found in a project's
 * package-lock.json.
 */
function getDependenciesFromLockfile(cwd: string = process.cwd()): Array<string> {
  const lockfilePath = findUp.sync('package-lock.json', {cwd});

  if (!lockfilePath) {
    return [];
  }

  const {dependencies} = require(lockfilePath);

  return Object.keys(dependencies);
}


/**
 * Provided a string, returns true if the string is a valid NPM package name.
 */
function isValidPackageName(name: string): boolean {
  return validateNpmPackageName(name).validForNewPackages;
}


/**
 * Replacement for 'npm link <package>' that can match multiple packages using
 * globs.
 */
export default function linkAll(pattern: string, userOpts: any = {}) {
  const opts = {
    cwd: process.cwd(),
    dryRun: false,
    ...userOpts
  };

  if (opts.dryRun) {
    log.info('', chalk.dim('Performing a dry run.'));
  }

  // const lockfilePath = findUp.sync('package-lock.json', {cwd: opts.cwd});

  // if (!lockfilePath) {
  //   throw new Error('Unable to find "package-lock.json".');
  // }

  // const {dependencies} = require(lockfilePath);

  const dependencies = getDependenciesFromLockfile(opts.cwd);

  const packagesToLink = dependencies.filter(minimatch.filter(pattern));

  if (!packagesToLink.length) {
    if (isValidPackageName(pattern)) {
      log.verbose('', chalk.dim('Input did not match any dependencies, but is a valid package name; treating as explicit.'));
      packagesToLink.push(pattern);
    } else {
      log.error('', chalk.dim('Input did not match any dependencies and is not a valid package name; aborting.'));
      return;
    }
  }

  packagesToLink.forEach(pkg => {
    log.info('', `${chalk.dim('Linking package:')} ${pkg}`);

    if (!opts.dryRun) {
      execa.shellSync(`npm link ${pkg}`);
    }
  });

  log.info('', `Successfully linked ${chalk.bold(String(packagesToLink.length))} ${packagesToLink.length === 1 ? 'package' : 'packages'}.`);
}
