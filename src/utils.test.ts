import topath from 'lodash.topath';
import { getPathValues } from './utils';

describe('getPathValues', () => {
  test('it returns the keys at the first level of nesting', () => {
    const obj = {
      'name': 'sqrypt',
      'type': 'function'
    }
    expect(getPathValues(obj, topath('[_]'))).toEqual(['name', 'type']);
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

    expect(getPathValues(obj, topath('functions[_]'))).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
  });

  test('it get keys from many objects', () => {
    const obj = {
      create: { func: 'createfn' },
      read: { func: 'readfn' },
      update: { func: 'updatefn' },
      delete: { func: 'deletefn' },
    };
    expect(getPathValues(obj, topath('[_].func'))).toEqual(expect.arrayContaining(['createfn', 'readfn', 'updatefn', 'deletefn']));
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
    }
    const path = topath('entities[_].functions[_]');
    expect(getPathValues(obj, path)).toEqual(expect.arrayContaining(['createCustomer', 'deleteCustomer', 'orderItem', 'cancelOrder']));
  });

  test('dangling path', () => {
    const obj = {
      one: { thing: { name: 'a' } },
      two: { thing: { name: 'b' } },
      three: { thing: { name: 'c' } }
    };
    const path = topath('[_].thing.name');
    expect(getPathValues(obj, path)).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  test('iterating arrays at path end', () => {
    const obj = {
      values: ['a', 'b', 'c']
    };
    const path = topath('values[_]');
    expect(getPathValues(obj, path)).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  test('iterating array in middle of path', () => {
    const obj = {
      fns: [
        { name: 'create', fn: () => {} },
        { name: 'read', fn: () => {} },
        { name: 'update', fn: () => {} },
        { name: 'delete', fn: () => {} }
      ]
    };
    const path = topath('fns[_].name');
    expect(getPathValues(obj, path)).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
    expect(getPathValues(obj, topath('fns[1].name'))).toEqual(expect.arrayContaining(['read']));
  });

  test('iterating array at beginning of path', () => {
    const arr = [
      { name: 'create', fn: () => {} },
      { name: 'read', fn: () => {} },
      { name: 'update', fn: () => {} },
      { name: 'delete', fn: () => {} }
    ];
    const path = topath('[_].name');
    expect(getPathValues(arr, path)).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
  });

  test('iterating multiple arrays', () => {
    const arr = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      ['g', 'h', 'i'],
    ];
    const path = topath('[_][_]');
    expect(getPathValues(arr, path)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']);
  });
});