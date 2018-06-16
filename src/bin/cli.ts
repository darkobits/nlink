#!/usr/bin/env node

import yargs from 'yargs';
import {CleanLinkOptions} from 'etc/types';
import cleanLink from 'lib/clean-link';
import log from 'lib/log';


// @ts-ignore
const options: CleanLinkOptions = yargs
.option('build-script', {
  description: 'NPM script that builds your project.',
  default: 'build'
})
.option('watch-arg', {
  description: 'Argument passed to the project\'s build tool to enable watch mode.',
  default: 'watch'
})
.option('out-dir-arg', {
  description: 'Argument passed to the project\'s build tool to indicate the desired output directory.',
  default: 'out-dir'
})
.option('dist-dir', {
  description: 'Location where the project\'s build artifacts are located.',
  default: 'dist'
})
.argv;


try {
  cleanLink(options);
} catch (err) {
  log.error('', err.stack);
  process.exit(1);
}
