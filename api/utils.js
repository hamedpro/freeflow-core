"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply_privileges = exports.validate_privileges = exports.validate_lock = exports.resolve_path = exports.all_paths = void 0;
function all_paths(object) {
    var results = [];
    function make_path(object, base) {
        for (var key in object) {
            var t = typeof object[key];
            if (t === "number" || t === "string" || Array.isArray(object[key])) {
                results.push(base.concat(key));
            }
            else {
                results.push(base.concat(key));
                make_path(object[key], base.concat(key));
            }
        }
    }
    //caution : only simple objects are accepted
    //meaning just these must be in hierarchy :
    //numbers, simple objects, arrays, strings
    make_path(object, []);
    return results;
}
exports.all_paths = all_paths;
var test1 = function () {
    return console.log(all_paths({
        name: "hamed",
        interests: {
            coding: 90,
            sleep: 60,
            k: {
                negin: [1, 2, 3, 4],
            },
        },
    }));
};
function resolve_path(object, path) {
    if (path.length === 0) {
        return undefined;
    }
    var result = object[path[0]];
    for (var i = 1; i < path.length; i++) {
        result = result[path[i]];
    }
    return result;
}
exports.resolve_path = resolve_path;
function validate_lock(lock) { }
exports.validate_lock = validate_lock;
function validate_privileges(privileges) { }
exports.validate_privileges = validate_privileges;
function apply_privileges(value, privileges) { }
exports.apply_privileges = apply_privileges;
//console.log(resolve_path({ k: { i: { j: "hamed" } } }, ["k", "i"]));
