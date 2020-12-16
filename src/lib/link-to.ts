import { ExecaWrapper } from '@darkobits/chex';
import minimatch from 'minimatch';

import log from 'lib/log';
import {
  isValidPackageName,
  getDependenciesFromLockfile
} from 'lib/utils';


/**
 * Replacement for 'npm link <package>' that can match multiple packages using
 * globs.
 */
export default function linkTo(npm: ExecaWrapper, packageOrPattern: string, userOpts: any = {}) {
  const opts = {
    cwd: process.cwd(),
    dryRun: false,
    ...userOpts
  };

  if (opts.dryRun) {
    log.info('', log.chalk.dim('Performing a dry run.'));
  }

  const dependencies = getDependenciesFromLockfile(opts.cwd);

  const packagesToLink = dependencies.filter(minimatch.filter(packageOrPattern));

  if (packagesToLink.length === 0) {
    if (isValidPackageName(packageOrPattern)) {
      log.verbose('', log.chalk.dim('Input did not match any dependencies, but is a valid package name; treating as explicit.'));
      packagesToLink.push(packageOrPattern);
    } else {
      log.error('', log.chalk.dim('Input did not match any dependencies and is not a valid package name; aborting.'));
      return;
    }
  }

  packagesToLink.forEach(pkg => {
    log.info('', `${log.chalk.dim('Linking package:')} ${pkg}`);

    if (!opts.dryRun) {
      npm.sync(['link', pkg]);
    }
  });

  log.info('', `Successfully linked ${log.chalk.bold(String(packagesToLink.length))} ${packagesToLink.length === 1 ? 'package' : 'packages'}.`);
}
