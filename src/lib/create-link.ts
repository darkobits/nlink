import path from 'path';

import chalk from 'chalk';
import fs from 'fs-extra';
import readPkgUp from 'read-pkg-up';

import {CreateLinkOptions, LinkDescriptor} from '../etc/types';
import log from 'lib/log';
import {getNpmLinkPaths, introspectPath} from 'lib/utils';


/**
 * Replacement for 'npm link' that creates an output directory that only
 * contains files essential for the package to run, rather than the entire
 * project directory.
 */
export default function link(userOptions: Partial<CreateLinkOptions> = {}) {
  // Merge user-provided options with defaults.
  const opts: CreateLinkOptions = {
    manifest: true,
    nodeModules: true,
    files: true,
    bin: true,
    dryRun: false,
    ...userOptions
  };

  const meta = readPkgUp.sync();
  const root = path.parse(meta.path).dir;

  if (!meta.pkg.name) {
    throw new Error('Package must have a "name" field in order to be linked.');
  }

  if (opts.dryRun) {
    log.info('', chalk.dim('Performing dry-run.'));
  }

  log.verbose('', `${chalk.dim('Package name:')} ${chalk.bold(meta.pkg.name)}`);

  const linkPaths = getNpmLinkPaths();


  // ----- Create Link Directory -----------------------------------------------

  const targetDirectoryInfo = introspectPath(linkPaths.pkg.link);

  if (targetDirectoryInfo.exists) {
    if (targetDirectoryInfo.isSymbolicLink) {
      // Target directory already exists, possibly from a prior 'npm link'.
      log.info('', `${chalk.dim('Removing existing symlink at:')} ${chalk.green(linkPaths.pkg.link)}`);

      if (!opts.dryRun) {
        fs.unlinkSync(linkPaths.pkg.link);
      }
    } else {
      // Target link directory exists and is NOT a symbolic link. Assume it was
      // created by us, and remove it.
      log.info('', `${chalk.dim('Removing existing directory at:')} ${chalk.green(linkPaths.pkg.link)}`);

      if (!opts.dryRun) {
        fs.removeSync(linkPaths.pkg.link);
      }
    }
  }

  log.info('', `${chalk.dim('Creating target directory:')} ${chalk.green(linkPaths.pkg.link)}`);

  if (!opts.dryRun) {
    fs.ensureDirSync(linkPaths.pkg.link);
  }


  // ----- Symlink Package Manifest --------------------------------------------

  if (opts.manifest) {
    const pkgJsonLink: LinkDescriptor = {
      src: meta.path,
      link: path.join(linkPaths.pkg.link, 'package.json')
    };

    log.info('', `${chalk.dim('Linking manifest:')} ${chalk.green(pkgJsonLink.link)} -> ${chalk.green(pkgJsonLink.src)}`);

    if (!opts.dryRun) {
      fs.symlinkSync(pkgJsonLink.src, pkgJsonLink.link);
    }
  }


  // ----- Symlink Dependencies ------------------------------------------------

  if (opts.nodeModules) {
    const nodeModulesLink: LinkDescriptor = {
      src: path.resolve(root, 'node_modules'),
      link: path.resolve(linkPaths.pkg.link, 'node_modules')
    };

    log.info('', `${chalk.dim('Linking dependencies:')} ${chalk.green(nodeModulesLink.link)} -> ${chalk.green(nodeModulesLink.src)}`);

    if (!opts.dryRun) {
      fs.symlinkSync(nodeModulesLink.src, nodeModulesLink.link);
    }
  }


  // ----- Symlink Files -------------------------------------------------------

  if (opts.files) {
    if (meta.pkg.files) {
      meta.pkg.files.forEach(fileEntry => {
        const fileLink: LinkDescriptor = {
          src: path.join(root, fileEntry),
          link: path.join(linkPaths.pkg.link, fileEntry)
        };

        log.info('', `${chalk.dim('Linking files:')} ${chalk.green(fileLink.link)} -> ${chalk.green(fileLink.src)}`);

        if (!opts.dryRun) {
          fs.symlinkSync(fileLink.src, fileLink.link);
        }
      });
    } else if (userOptions.files) {
      // User explicitly requested that "files" be linked, but did not declare
      // any.
      log.warn('', 'Unable to symlink files; host package does not declare any "files" entries.');
    }
  }


  // ----- Symlink Binaries ----------------------------------------------------

  if (opts.bin) {
    if (linkPaths.bin) {
      linkPaths.bin.forEach(binLink => {
        const linkInfo = introspectPath(binLink.link);

        if (!linkInfo.exists) {
          // Symbolic link/binary does not exist.
          log.info('', `${chalk.dim('Linking binary:')} ${chalk.green(binLink.link)} -> ${chalk.green(binLink.src)}`);

          if (!opts.dryRun) {
            fs.symlinkSync(binLink.src, binLink.link);
          }
        } else if (linkInfo.realPath === binLink.src) {
          // Symbolic link already exists and points to the desired target path.
          log.info('', `${chalk.dim('Symlink for binary')} ${binLink.link} ${chalk.dim('already exists; skipping.')}`);
        } else if (linkInfo.isSymbolicLink) {
          // Symbolic link already exists but points to a different path.
          log.warn('', `${chalk.dim('Refusing to overwrite existing symbolic link:')} ${chalk.magenta(binLink.link)} -> ${linkInfo.realPath}`);
        } else {
          // Binary already exists.
          log.warn('', `${chalk.dim('Refusing to overwrite existing binary:')} ${chalk.red(binLink.link)}`);
        }
      });
    } else if (userOptions.bin) {
      // User explicitly requested that binaries be linked, but did not declare
      // any.
      log.warn('', 'Unable to symlink binaries; host package does not declare any "bin" entries.');
    }
  }
}
