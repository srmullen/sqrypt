#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const cross_spawn_1 = require("cross-spawn");
const helpers_1 = require("yargs/helpers");
const inquirer_1 = __importDefault(require("inquirer"));
const yaml_1 = __importDefault(require("yaml"));
const lodash_topath_1 = __importDefault(require("lodash.topath"));
const utils_1 = require("./utils");
const regex_1 = require("./regex");
;
// TODO: Construct question.
// TODO: Question ordering.
function isParameter(input) {
    // Params start with '%'. They cannot end with '%' because that is an environment variable on windows.
    return input[0] === '%' && input[input.length - 1] !== '%';
}
function gatherParams(pkg, scriptName, scriptParams, input) {
    const params = {};
    const files = {};
    scriptParams.forEach(param => {
        if (params[param]) {
            return;
        }
        if (isParameter(param)) {
            const id = crypto_1.default.randomBytes(12).toString('hex');
            // Check if the param references a file.
            let match;
            if (match = param.match(regex_1.OPTION_RE)) {
                const index = Number(match[1]);
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
            if (match = param.match(regex_1.FILE_RE)) {
                const [, filename, ext, path] = match;
                // console.log(`${param}: ${filename} - ${path}`);
                if (!files[filename]) {
                    if (ext === 'json') {
                        const file = fs_1.default.readFileSync(filename, 'utf-8');
                        files[filename] = JSON.parse(file);
                    }
                    else if (ext === 'yaml' || ext === 'yml') {
                        const file = fs_1.default.readFileSync(filename, 'utf-8');
                        files[filename] = yaml_1.default.parse(file);
                    }
                }
                const options = (0, utils_1.getPathValues)(files[filename], (0, lodash_topath_1.default)(path));
                params[param] = {
                    id,
                    name: param,
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const pkg = JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8'));
        const scriptName = (0, utils_1.assertString)(process.env.npm_lifecycle_event);
        const script = pkg.scripts[scriptName];
        const args = (0, helpers_1.hideBin)(process.argv);
        const scriptParams = script.split(/\s+/).slice(1);
        const input = args.slice(scriptParams.length);
        const params = gatherParams(pkg, scriptName, scriptParams, input);
        const questions = Object.values(params).reduce((acc, param) => {
            if (param.answer) {
                return acc;
            }
            return acc.concat(param.question);
        }, []);
        const prompt = questions
            ? yield inquirer_1.default.prompt(questions)
            : {};
        const command = scriptParams.map((option) => {
            // const param = params.find(param => param.name === option);
            const param = params[option];
            if (param) {
                return param.answer || prompt[param.id];
            }
            else {
                return option;
            }
        });
        const proc = (0, cross_spawn_1.spawn)(command[0], command.slice(1), {
            stdio: 'inherit'
        });
        // https://github.com/kentcdodds/cross-env/blob/master/src/index.js#L24
        process.on('SIGTERM', () => proc.kill('SIGTERM'));
        process.on('SIGINT', () => proc.kill('SIGINT'));
        process.on('SIGBREAK', () => proc.kill('SIGBREAK'));
        process.on('SIGHUP', () => proc.kill('SIGHUP'));
        proc.on('exit', (code, signal) => {
            let crossEnvExitCode = code;
            // exit code could be null when OS kills the process(out of memory, etc) or due to node handling it
            // but if the signal is SIGINT the user exited the process so we want exit code 0
            if (crossEnvExitCode === null) {
                crossEnvExitCode = signal === 'SIGINT' ? 0 : 1;
            }
            process.exit(crossEnvExitCode);
        });
    });
}
main();
