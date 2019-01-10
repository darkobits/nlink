#!/usr/bin/env node

import yargs, {Arguments} from 'yargs';

import {CreateLinkOptions} from '../etc/types';
import createLink from 'lib/create-link';
import linkAll from 'lib/link-all';
import log from 'lib/log';


yargs.usage('$0 [packageOrPattern] (Link one or more packages into the local package.)');

yargs.usage('$0 [flags] (Link the local package to the global folder.)');

yargs.option('manifest', {
  description: 'Whether to symlink the host package\'s manifest (package.json). [Default: true]',
  type: 'boolean',
  required: false
});

yargs.option('nodeModules', {
  description: 'Whether to symlink the host package\'s "node_modules" directory. [Default: true]',
  type: 'boolean',
  required: false
});

yargs.option('files', {
  description: 'Whether to symlink the host package\'s "files", as enumerated in package.json. [Default: true]',
  type: 'boolean',
  required: false
});

yargs.option('bin', {
  description: 'Whether to symlink the host package\'s binaries, as enumerated in package.json. [Default: true]',
  type: 'boolean',
  required: false
});

yargs.option('dryRun', {
  description: 'Perform a dry-run.',
  type: 'boolean',
  required: false
});

yargs.example('nlink --files=false', 'Link the local package, but do not link the "files" declared in its package.json.');
yargs.example('nlink "@babel/*"', 'Link to all packages matching "@babel/');

yargs.epilogue('For more information, see: https://docs.npmjs.com/cli/link.html');

yargs.showHelpOnFail(true, 'See --help for usage instructions.');
yargs.wrap(yargs.terminalWidth());
yargs.version();
yargs.strict();
yargs.help();


try {
  const args = yargs.argv as (Arguments & CreateLinkOptions);
  const [packageOrPattern] = args._;

  if (args.dryRun) {
    log.level = 'silly';
  }

  if (packageOrPattern) {
    linkAll(packageOrPattern, {dryRun: args.dryRun});
  } else {
    createLink(args);
  }
} catch (err) {
  log.error('', err.stack);
  process.exit(1);
}
