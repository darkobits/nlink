#!/usr/bin/env node

import yargs, {Arguments} from 'yargs';

import {CreateLinkOptions} from '../etc/types';
import makeLinkable from 'src/lib/make-linkable';
import linkTo from 'src/lib/link-to';
import log from 'lib/log';


yargs.usage('$0 [packageOrPattern] (Link to one or more packages.)');

yargs.usage('$0 [flags] (Make the local package linkable.)');

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

yargs.example('nlink --bin=false', 'Make the local package linkable, but do not symlink the "bin" files declared in its package.json.');
yargs.example('nlink "@babel/**"', 'Link to all packages matching "@babel/".');

yargs.epilogue('For more information, see: https://docs.npmjs.com/cli/link.html');

yargs.showHelpOnFail(true, 'See --help for usage instructions.');
yargs.wrap(yargs.terminalWidth());
yargs.version();
yargs.strict();
yargs.help();


try {
  const args = yargs.argv as Arguments<CreateLinkOptions>;
  const [packageOrPattern] = args._;

  if (args.dryRun) {
    log.level = 'silly';
  }

  if (packageOrPattern) {
    linkTo(packageOrPattern, {dryRun: args.dryRun});
  } else {
    makeLinkable(args);
  }
} catch (err) {
  log.error('', err.stack);
  process.exit(1);
}
