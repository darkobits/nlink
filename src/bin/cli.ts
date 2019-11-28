#!/usr/bin/env node

import os from 'os';

import chex from '@darkobits/chex';
import cli from '@darkobits/saffron';

import {CreateLinkOptions} from 'etc/types';
import makeLinkable from 'lib/make-linkable';
import linkTo from 'lib/link-to';
import log from 'lib/log';


cli.command<CreateLinkOptions>({
  builder: ({command}) => {
    command.option('manifest', {
      description: 'Whether to symlink the host package\'s manifest (package.json). [Default: true]',
      type: 'boolean',
      required: false
    });

    command.option('nodeModules', {
      description: 'Whether to symlink the host package\'s "node_modules" directory. [Default: true]',
      type: 'boolean',
      required: false
    });

    command.option('files', {
      description: 'Whether to symlink the host package\'s "files", as enumerated in package.json. [Default: true]',
      type: 'boolean',
      required: false
    });

    command.option('bin', {
      description: 'Whether to symlink the host package\'s binaries, as enumerated in package.json. [Default: true]',
      type: 'boolean',
      required: false
    });

    command.option('dry-run', {
      description: 'Perform a dry-run.',
      type: 'boolean',
      required: false
    });

    command.example('nlink --bin=false', 'Make the local package linkable, but do not symlink the "bin" files declared in its package.json.');
    command.example('nlink "@babel/**"', 'Link to all packages matching "@babel/".');

    command.epilogue('For more information, see: https://docs.npmjs.com/cli/link.html');
  },
  handler: async ({argv}) => {
    try {
      const [packageOrPattern] = argv._;

      if (argv.dryRun) {
        log.level = 'silly';
      }

      // Ensure NPM is installed, throw if not.
      const npm = await chex('np2m');

      if (packageOrPattern) {
        linkTo(npm, packageOrPattern, {dryRun: argv.dryRun});
      } else {
        makeLinkable(npm, argv);
      }
    } catch (err) {
      log.error('', err.message);
      log.verbose('', err.stack.split(os.EOL).slice(1).join(os.EOL));
      process.exit(err.code || 1);
    }
  }
});


cli.init();
