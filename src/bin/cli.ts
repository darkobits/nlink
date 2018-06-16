#!/usr/bin/env node

import yargs from 'yargs';

import {
  DEFAULT_BUILD_SCRIPT,
  DEFAULT_WATCH_ARG,
  DEFAULT_OUT_DIR_ARG,
  DEFAULT_DIST_DIR
} from 'etc/constants';

import {CleanLinkOptions} from 'etc/types';
import cleanLink from 'lib/clean-link';
import log from 'lib/log';


// @ts-ignore
const options: CleanLinkOptions = yargs
.option('build-script', {
  description: 'NPM script that builds your project.',
  default: DEFAULT_BUILD_SCRIPT
})
.option('watch-arg', {
  description: 'Argument passed to the project\'s build tool to enable watch mode.',
  default: DEFAULT_WATCH_ARG
})
.option('out-dir-arg', {
  description: 'Argument passed to the project\'s build tool to indicate the desired output directory.',
  default: DEFAULT_OUT_DIR_ARG
})
.option('dist-dir', {
  description: 'Location where the project\'s build artifacts are located.',
  default: DEFAULT_DIST_DIR
})
.argv;


try {
  cleanLink(options);
} catch (err) {
  log.error('', err.stack);
  process.exit(1);
}
