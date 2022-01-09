#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'cross-spawn';
import { hideBin } from 'yargs/helpers';

function assertString(inp: any): string {
  if (typeof inp === 'string') {
    return inp;
  } else {
    throw new Error(`script not found`);
  }
}

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const scriptName: string = assertString(process.env.npm_lifecycle_event);
const script = pkg.scripts[scriptName];

const args = hideBin(process.argv);

const scriptParams = script.split(/\s+/).slice(1);
const input = args.slice(scriptParams.length);

// console.log("script: ", script);
// console.log("args: ", args);
// console.log(script.split(/\s+/).slice(1));
// console.log({scriptParams});
// console.log({input});

// const OPTION_RE = /\{([0-9]+)\}/
const OPTION_RE = /%(\d+)/

const command = scriptParams.map((option: string) => {
  const match = option.match(OPTION_RE);
  if (match) {
    const idx = Number(match[1]);
    return input[idx];
  }
  return option;
});

const proc = spawn(command[0], command.slice(1), {
  stdio: 'inherit'
});
