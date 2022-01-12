#!/usr/bin/env node

import fs from 'fs';
import crypto from 'crypto';
import { spawn } from 'cross-spawn';
import { hideBin } from 'yargs/helpers';
import inquirer, { DistinctQuestion, QuestionCollection } from 'inquirer';
import YAML from 'yaml';
import topath from 'lodash.topath';
import { assertString, getPathValues } from './utils';

interface Parameter {
  id: string,
  name: string,
  question: DistinctQuestion,
  index?: number,
  answer?: string
};

function isParameter(input: string) {
  // Params start with '%'. They cannot end with '%' because that is an environment variable on windows.
  return input[0] === '%' && input[input.length-1] !== '%';
}

function gatherParams(pkg: Record<any, any>, scriptName: string, scriptParams: string[], input: string[]): Parameter[] {
  // const questions = pkg.sqrypt?.[scriptName]?.questions;
  // return questions;

  const questions: Parameter[] = [];

  const files: { [key: string]: any } = {};

  const OPTION_RE = /%(\d+)$/;
  const FILE_RE = /^%(.*\.(json|yml|yaml))\[(_)\]/;
  scriptParams.map(param => {
    if (isParameter(param)) {
      const id = crypto.randomBytes(12).toString('hex');

      // Check if the param references a file.
      let match;
      if (match = param.match(OPTION_RE)) {
        const index = Number(match[1]);
        const answer = input[index];
        questions.push({
          id,
          name: param,
          answer,
          index,
          question: {
            type: 'input',
            message: param,
            name: id
          }
        });
      }

      if (match = param.match(FILE_RE)) {
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
          id,
          name: param,
          question: {
            type: 'list',
            message: param,
            name: id,
            choices: options
          }
        });
      }
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

  const params = gatherParams(pkg, scriptName, scriptParams, input);

  const questions = params.reduce<DistinctQuestion[]>((acc, param) => {
    if (param.answer) {
      return acc;
    }
    return acc.concat(param.question);
  }, []);

  const prompt = questions
    ? await inquirer.prompt<{ [key: string | number]: string }>(questions)
    : {};
  
  const command = scriptParams.map((option: string) => {
    const param = params.find(param => param.name === option);
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