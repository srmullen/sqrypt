#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'cross-spawn';
import { hideBin } from 'yargs/helpers';
import inquirer, { DistinctQuestion } from 'inquirer';
import { assertString } from './utils';
import { gatherParams, sortParams } from './params';

async function main() {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

  const scriptName: string = assertString(process.env.npm_lifecycle_event);
  const script = pkg.scripts[scriptName];
  const args = hideBin(process.argv);
  const scriptParams = script.split(/\s+/).slice(1);
  const input = args.slice(scriptParams.length);

  const params = gatherParams(scriptParams, input);

  const questions = sortParams(params).reduce<DistinctQuestion[]>((acc, param) => {
    if (param.answer) {
      return acc;
    }
    return acc.concat(param.question);
  }, []);

  const prompt = questions
    ? await inquirer.prompt<{ [key: string | number]: string }>(questions)
    : {};
  
  const command = scriptParams.map((option: string) => {
    const param = params[option];
    if (param) {
      return param.answer || prompt[param.id];
    } else {
      return option;
    }
  });

  const proc = spawn(command[0], command.slice(1), {
    stdio: 'inherit'
  });

  // https://github.com/kentcdodds/cross-env/blob/master/src/index.js#L24
  process.on('SIGTERM', () => proc.kill('SIGTERM'))
  process.on('SIGINT', () => proc.kill('SIGINT'))
  process.on('SIGBREAK', () => proc.kill('SIGBREAK'))
  process.on('SIGHUP', () => proc.kill('SIGHUP'))
  proc.on('exit', (code, signal) => {
    let crossEnvExitCode = code
    // exit code could be null when OS kills the process(out of memory, etc) or due to node handling it
    // but if the signal is SIGINT the user exited the process so we want exit code 0
    if (crossEnvExitCode === null) {
      crossEnvExitCode = signal === 'SIGINT' ? 0 : 1
    }
    process.exit(crossEnvExitCode);
  });
}

main();