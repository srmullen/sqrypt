import fs from 'fs';
import crypto from 'crypto';
import YAML from 'yaml';
import topath from 'lodash.topath';
import type { DistinctQuestion } from 'inquirer';
import { getPathValues } from './utils';
import { OPTION_RE, FILE_RE } from './regex';

interface Parameter {
  id: string,
  name: string,
  question: DistinctQuestion,
  index: number,
  answer?: string
};

function isParameter(input: string) {
  // Params start with '%'. They cannot end with '%' because that is an environment variable on windows.
  return input[0] === '%' && input[input.length-1] !== '%';
}

export function gatherParams(pkg: Record<any, any>, scriptName: string, scriptParams: string[], input: string[]) {
  const params: Record<string, Parameter> = {};

  const files: { [key: string]: any } = {};

  scriptParams.forEach(param => {
    if (params[param]) {
      return;
    }
    if (isParameter(param)) {
      const id = crypto.randomBytes(12).toString('hex');

      let indexTracker = -1;

      // Check if the param references a file.
      let match;
      if (match = param.match(OPTION_RE)) {
        const index = Number(match[1]);
        if (index > indexTracker) {
          indexTracker = index;
        }
        const answer = input[index];
        params[param] = {
          id,
          name: param,
          answer,
          index,
          question: {
            type: 'input',
            message: param,
            name: id
          }
        }; 
      }

      if (match = param.match(FILE_RE)) {
        const [, filename, ext, path] = match;
        indexTracker += 0.01;
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
        params[param] = {
          id,
          name: param,
          index: indexTracker,
          question: {
            type: 'list',
            message: param,
            name: id,
            choices: options
          }
        };
      }
    }
  });

  return params;
}

export function sortParams(params: Record<string, Parameter>): Parameter[] {
  const sorted = Object.values(params);
  sorted.sort((paramA, paramB) => {
    if (paramA.index > paramB.index) {
      return 1;
    } else if (paramA.index < paramB.index) {
      return -1;
    } else {
      return 0;
    }
  });

  return sorted;
}