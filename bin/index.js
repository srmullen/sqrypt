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
const cross_spawn_1 = require("cross-spawn");
const helpers_1 = require("yargs/helpers");
const inquirer_1 = __importDefault(require("inquirer"));
function assertString(inp) {
    if (typeof inp === 'string') {
        return inp;
    }
    else {
        throw new Error(`script not found`);
    }
}
function main() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const pkg = JSON.parse(fs_1.default.readFileSync('./package.json', 'utf-8'));
        const scriptName = assertString(process.env.npm_lifecycle_event);
        const script = pkg.scripts[scriptName];
        const questions = (_b = (_a = pkg.sqrypt) === null || _a === void 0 ? void 0 : _a[scriptName]) === null || _b === void 0 ? void 0 : _b.questions;
        const args = (0, helpers_1.hideBin)(process.argv);
        const scriptParams = script.split(/\s+/).slice(1);
        const input = args.slice(scriptParams.length);
        // console.log("script: ", script);
        // console.log("args: ", args);
        // console.log(script.split(/\s+/).slice(1));
        // console.log({scriptParams});
        // console.log({input});
        const prompt = yield inquirer_1.default.prompt(questions);
        // const OPTION_RE = /\{([0-9]+)\}/
        const OPTION_RE = /%(\d+)/;
        const command = scriptParams.map((option) => {
            const match = option.match(OPTION_RE);
            if (match) {
                const idx = Number(match[1]);
                return input[idx] || prompt[idx];
            }
            return option;
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
