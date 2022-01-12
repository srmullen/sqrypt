"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_RE = exports.OPTION_RE = void 0;
// Matches standard params
exports.OPTION_RE = /%(\d+)$/;
// Matches file reading params
exports.FILE_RE = /^%\{(.*\.(json|yml|yaml))\}\.?(.*)/;
