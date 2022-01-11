"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathValues = exports.assertString = void 0;
function assertString(inp) {
    if (typeof inp === 'string') {
        return inp;
    }
    else {
        throw new Error(`script not found`);
    }
}
exports.assertString = assertString;
function getPathValues(obj, path, p = 0) {
    let ret = [];
    function _getPathValues(items, obj, path, p = 0) {
        while (obj && p < path.length) {
            if (path[p] === '_') {
                if (p === path.length - 1) {
                    // The last value is an iterator, so gather the keys of an object, or items in an array.
                    const toadd = Array.isArray(obj) ? obj : Object.keys(obj);
                    toadd.forEach(item => items.push(item));
                }
                else {
                    for (let k in obj) {
                        _getPathValues(items, obj[k], path, p + 1);
                    }
                }
            }
            else {
                // Add the dangling path `[_].dangling.path`
                if (p === path.length - 1) {
                    items.push(obj[path[p]]);
                }
            }
            obj = obj[path[p++]];
        }
    }
    _getPathValues(ret, obj, path, p);
    return ret;
}
exports.getPathValues = getPathValues;
