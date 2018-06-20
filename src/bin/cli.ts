#!/usr/bin/env node
import cleanLink from 'lib/clean-link';
import log from 'lib/log';


try {
  process.stdout.write(cleanLink());
} catch (err) {
  log.error('', err.stack);
  process.exit(1);
}
