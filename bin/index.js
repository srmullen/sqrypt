#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cross_spawn_1 = require("cross-spawn");
const helpers_1 = require("yargs/helpers");
const args = (0, helpers_1.hideBin)(process.argv);
const [command, ...options] = args;
const proc = (0, cross_spawn_1.spawn)(command, options, {
    stdio: 'inherit'
});
