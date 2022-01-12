"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regex_1 = require("./regex");
describe('regex', () => {
    describe('FILE_RE', () => {
        test('it matches', () => {
            const param = '%{./package.json}[_]';
            const match = param.match(regex_1.FILE_RE);
            expect(match).not.toBeNull();
        });
        test('it matches without path', () => {
            const param = '%{./package.json}';
            const match = param.match(regex_1.FILE_RE);
            expect(match).not.toBeNull();
        });
        test('it matches', () => {
            const param = '%{./package.json}.functions[_]';
            const match = param.match(regex_1.FILE_RE);
            expect(match).not.toBeNull();
        });
        test('it returns the filename, filetype, and path', () => {
            {
                const match = '%{./package.json}.scripts[_]'.match(regex_1.FILE_RE);
                expect(match === null || match === void 0 ? void 0 : match[1]).toEqual('./package.json');
                expect(match === null || match === void 0 ? void 0 : match[2]).toEqual('json');
                expect(match === null || match === void 0 ? void 0 : match[3]).toEqual('scripts[_]');
            }
            {
                const match = '%{./serverless.yml}[_]'.match(regex_1.FILE_RE);
                expect(match === null || match === void 0 ? void 0 : match[1]).toEqual('./serverless.yml');
                expect(match === null || match === void 0 ? void 0 : match[2]).toEqual('yml');
                expect(match === null || match === void 0 ? void 0 : match[3]).toEqual('[_]');
            }
            {
                const match = '%{./k8s.yaml}[_].kind'.match(regex_1.FILE_RE);
                expect(match === null || match === void 0 ? void 0 : match[1]).toEqual('./k8s.yaml');
                expect(match === null || match === void 0 ? void 0 : match[2]).toEqual('yaml');
                expect(match === null || match === void 0 ? void 0 : match[3]).toEqual('[_].kind');
            }
        });
    });
});
