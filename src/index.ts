#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'cross-spawn';
import { hideBin } from 'yargs/helpers';
import inquirer, { DistinctQuestion, QuestionCollection } from 'inquirer';
import YAML from 'yaml';
import topath from 'lodash.topath';
import { assertString, getPathValues } from './utils';

function gatherQuestions(pkg: Record<any, any>, scriptName: string, scriptParams: string[]): Option<QuestionCollection> {
  // const questions = pkg.sqrypt?.[scriptName]?.questions;
  // return questions;

  const questions: DistinctQuestion[] = [];

  const files: { [key: string]: any } = {};

  const FILE_RE = /(^.*\.(json|yml|yaml))\[(_)\]/;
  scriptParams.map(param => {
    const match = param.match(FILE_RE);
    if (match) {
      const [, filename, ext, path] = match;
      // console.log(`${param}: ${filename} - ${path}`);
      if (!files[filename]) {
        if (ext === 'json') {
          const file = fs.readFileSync(filename, 'utf-8');
          files[filename] = JSON.parse(file);
        } else if (ext === 'yaml' || ext === 'yml') {
          const file = fs.readFileSync(filename, 'utf-8');
          files[filename] = YAML.parse(file);
        }
      }

      const options = getPathValues(files[filename], topath(path));
      questions.push({
        type: 'checkbox',
        message: `Input: `,
        name: 'q1',
        choices: options
      });
    }
  });

  return questions;
}

async function main() {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

  const scriptName: string = assertString(process.env.npm_lifecycle_event);
  const script = pkg.scripts[scriptName];
  const args = hideBin(process.argv);
  const scriptParams = script.split(/\s+/).slice(1);
  const input = args.slice(scriptParams.length);

  // console.log(scriptParams);

  const questions = gatherQuestions(pkg, scriptName, scriptParams);

  const prompt = questions 
    ? await inquirer.prompt<{ [key: string | number]: string }>(questions) 
    : {};

  const OPTION_RE = /%(\d+)/
  const command = scriptParams.map((option: string) => {
    const match = option.match(OPTION_RE);
    if (match) {
      const idx = Number(match[1]);
      return input[idx] || prompt[idx];
    }
    return option;
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