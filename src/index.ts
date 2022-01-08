#!/usr/bin/env node

import { spawn } from 'cross-spawn';
import { hideBin } from 'yargs/helpers';

const args = hideBin(process.argv);

const [command, ...options] = args;

const proc = spawn(command, options, {
  stdio: 'inherit'
});
