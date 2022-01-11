"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_topath_1 = __importDefault(require("lodash.topath"));
const utils_1 = require("./utils");
describe('getPathValues', () => {
    test('it returns the keys at the first level of nesting', () => {
        const obj = {
            'name': 'sqrypt',
            'type': 'function'
        };
        expect((0, utils_1.getPathValues)(obj, (0, lodash_topath_1.default)('[_]'))).toEqual(['name', 'type']);
    });
    test('it gets the keys in a nested object', () => {
        const obj = {
            functions: {
                create: 'fn',
                update: 'fn',
                read: 'fn',
                delete: 'fn'
            }
        };
        expect((0, utils_1.getPathValues)(obj, (0, lodash_topath_1.default)('functions[_]'))).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
    });
    test('it get keys from many objects', () => {
        const obj = {
            create: { func: 'createfn' },
            read: { func: 'readfn' },
            update: { func: 'updatefn' },
            delete: { func: 'deletefn' },
        };
        expect((0, utils_1.getPathValues)(obj, (0, lodash_topath_1.default)('[_].func'))).toEqual(expect.arrayContaining(['createfn', 'readfn', 'updatefn', 'deletefn']));
    });
    test('it can use multiple iterators', () => {
        const obj = {
            entities: {
                customer: {
                    functions: { createCustomer: '', deleteCustomer: '' }
                },
                order: {
                    functions: { orderItem: '', cancelOrder: '' }
                }
            }
        };
        const path = (0, lodash_topath_1.default)('entities[_].functions[_]');
        expect((0, utils_1.getPathValues)(obj, path)).toEqual(expect.arrayContaining(['createCustomer', 'deleteCustomer', 'orderItem', 'cancelOrder']));
    });
    test('dangling path', () => {
        const obj = {
            one: { thing: { name: 'a' } },
            two: { thing: { name: 'b' } },
            three: { thing: { name: 'c' } }
        };
        const path = (0, lodash_topath_1.default)('[_].thing.name');
        expect((0, utils_1.getPathValues)(obj, path)).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    });
    test('iterating arrays at path end', () => {
        const obj = {
            values: ['a', 'b', 'c']
        };
        const path = (0, lodash_topath_1.default)('values[_]');
        expect((0, utils_1.getPathValues)(obj, path)).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    });
    test('iterating array in middle of path', () => {
        const obj = {
            fns: [
                { name: 'create', fn: () => { } },
                { name: 'read', fn: () => { } },
                { name: 'update', fn: () => { } },
                { name: 'delete', fn: () => { } }
            ]
        };
        const path = (0, lodash_topath_1.default)('fns[_].name');
        expect((0, utils_1.getPathValues)(obj, path)).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
        expect((0, utils_1.getPathValues)(obj, (0, lodash_topath_1.default)('fns[1].name'))).toEqual(expect.arrayContaining(['read']));
    });
    test('iterating array at beginning of path', () => {
        const arr = [
            { name: 'create', fn: () => { } },
            { name: 'read', fn: () => { } },
            { name: 'update', fn: () => { } },
            { name: 'delete', fn: () => { } }
        ];
        const path = (0, lodash_topath_1.default)('[_].name');
        expect((0, utils_1.getPathValues)(arr, path)).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
    });
    test('iterating multiple arrays', () => {
        const arr = [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i'],
        ];
        const path = (0, lodash_topath_1.default)('[_][_]');
        expect((0, utils_1.getPathValues)(arr, path)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']);
    });
});
