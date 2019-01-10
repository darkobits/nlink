import chalk from 'chalk';
import execa from 'execa';
import findUp from 'find-up';
import minimatch from 'minimatch';

import log from 'lib/log';

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

  const lockfilePath = findUp.sync('package-lock.json', {cwd: opts.cwd});

  if (!lockfilePath) {
    throw new Error('Unable to find "package-lock.json".');
  }

  const {dependencies} = require(lockfilePath);

  const packagesToLink = Object.keys(dependencies).filter(minimatch.filter(pattern));

  if (!packagesToLink.length) {
    log.warn('', `${chalk.dim('Zero dependencies matched pattern:')} ${pattern}`);
    return;
  }

  packagesToLink.forEach(pkg => {
    log.info('', `${chalk.dim('Linking package:')} ${pkg}`);

    if (!opts.dryRun) {
      execa.shellSync(`npm link ${pkg}`);
    }
  });

  log.info('', `Successfully linked ${chalk.bold(String(packagesToLink.length))} ${packagesToLink.length === 1 ? 'package' : 'packages'}.`);
}
