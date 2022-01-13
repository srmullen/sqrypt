"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortParams = exports.gatherParams = void 0;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const yaml_1 = __importDefault(require("yaml"));
const lodash_topath_1 = __importDefault(require("lodash.topath"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("./utils");
const regex_1 = require("./regex");
;
function isParameter(input) {
    // Params start with '%'. They cannot end with '%' because that is an environment variable on windows.
    return input[0] === '%' && input[input.length - 1] !== '%';
}
function createMessage(scriptParams, currentParam) {
    return scriptParams.reduce((message, param) => {
        if (!isParameter(param)) {
            return `${message}${param} `;
        }
        if (param === currentParam) {
            return `${message}${chalk_1.default.green('_____')} `;
        }
        return `${message}${chalk_1.default.bgMagenta('     ')} `;
    }, '');
}
function gatherParams(scriptParams, input) {
    const params = {};
    const files = {};
    scriptParams.forEach(param => {
        if (params[param]) {
            return;
        }
        if (isParameter(param)) {
            const id = crypto_1.default.randomBytes(12).toString('hex');
            let indexTracker = -1;
            // Check if the param references a file.
            let match;
            if (match = param.match(regex_1.OPTION_RE)) {
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
                        message: createMessage(scriptParams, param),
                        name: id
                    }
                };
            }
            if (match = param.match(regex_1.FILE_RE)) {
                const [, filename, ext, path] = match;
                indexTracker += 0.01;
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
                    index: indexTracker,
                    question: {
                        type: 'list',
                        message: createMessage(scriptParams, param),
                        name: id,
                        choices: options
                    }
                };
            }
        }
    });
    return params;
}
exports.gatherParams = gatherParams;
function sortParams(params) {
    const sorted = Object.values(params);
    sorted.sort((paramA, paramB) => {
        if (paramA.index > paramB.index) {
            return 1;
        }
        else if (paramA.index < paramB.index) {
            return -1;
        }
        else {
            return 0;
        }
    });
    return sorted;
}
exports.sortParams = sortParams;
