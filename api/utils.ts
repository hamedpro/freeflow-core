import { useNavigate } from "react-router-dom"
import rdiff, { rdiffResult } from "recursive-diff"
import { custom_find_unique, unique_items_of_array } from "../common_helpers.js"
import {
    cache,
    cache_item,
    complete_diff,
    locks,
    meta,
    non_file_meta_value,
    thing,
    transaction,
} from "./UnifiedHandler_types.js"
import jwtDecode from "jwt-decode"
import axios from "axios"
import { UnifiedHandlerClient } from "./UnifiedHandlerClient.js"
export function custom_deepcopy(value: any) {
    return JSON.parse(JSON.stringify(value))
}
export function calc_all_paths(value: object | undefined) {
    if (value === undefined) return []

    var results: string[][] = []
    function make_path(object: any, base: string[]) {
        for (var key in object) {
            var t = typeof object[key]
            if (
                t === "number" ||
                t === "string" ||
                Array.isArray(object[key])
            ) {
                results.push(base.concat(key))
            } else {
                results.push(base.concat(key))
                make_path(object[key], base.concat(key))
            }
        }
    }
    make_path(value, [])
    return results
}
export function resolve_path(object: any, paths: string[]) {
    if (object === undefined) return undefined
    if (paths.length === 0) {
        return undefined
    }
    var result = object[paths[0]]
    for (var i = 1; i < paths.length; i++) {
        if (!(typeof result === "object" && result !== null)) break
        result = result[paths[i]]
    }
    return result
}
export function validate_lock_structure(locks: locks) {
    for (var lock of locks) {
        if (lock.value === undefined) {
            continue
        }
        for (var lock2 of locks.filter((i) => {
            if (!(lock.path.length < i.path.length)) {
                return false
            }
            for (var index in lock.path) {
                if (lock.path[index] !== i.path[index]) {
                    return false
                }
            }
            return true
        })) {
            if (lock2.value !== lock.value) {
                return false
            }
        }
    }
    return true
}
export function thing_transactions(
    transactinos: transaction[],
    thing_id: number
) {
    return transactinos.filter((i) => i.thing_id === thing_id)
}
export function check_lock({
    user_id,
    thing_id,
    cache,
    paths,
}: {
    thing_id: number | undefined
    user_id: number
    cache: cache
    paths: string[][] // patchs you want to check if are locked or not
}): boolean {
    //returns true if its not locked or is locked for the passed user
    if (thing_id === undefined) return true

    var item = cache.find((i) => i.thing_id === thing_id)

    if (item?.thing.type === "meta") {
        return true
    } else {
        var meta = cache.find(
            (i: cache_item) =>
                i.thing.type === "meta" &&
                "locks" in i.thing.value &&
                i.thing.value.thing_id === thing_id
        )
        if (meta === undefined) {
            throw "meta was not found for this this. create it first."
        } else {
            if ("locks" in meta.thing.value) {
                for (var path of paths) {
                    var tmp = meta.thing.value.locks.find((i) =>
                        simple_arrays_are_identical(i.path, path)
                    )

                    if (
                        tmp !== undefined &&
                        tmp.value !== undefined &&
                        tmp.value !== user_id
                    ) {
                        return false
                    }
                }
                return true
            }
        }
    }

    return false
}
export function calc_user_discoverable_things(
    transactions: transaction[],
    cache: cache,
    user_id: number
): number[] {
    //returns an array of thing_ids
    return cache
        .filter((i) => {
            if (i.thing.type === "meta") {
                return true
            } else {
                var meta = cache.find((j) => {
                    return (
                        j.thing.type === "meta" &&
                        "locks" in j.thing.value &&
                        j.thing.value.thing_id === i.thing_id
                    )
                })
                if (meta === undefined) {
                    return (
                        user_id ===
                        thing_transactions(transactions, i.thing_id)[0].user_id
                    )
                } else {
                    function is_meta(
                        cache_item: cache_item
                    ): cache_item is { thing_id: number; thing: meta } {
                        return cache_item.thing.type === "meta"
                    }
                    if (is_meta(meta)) {
                        if ("locks" in meta.thing.value) {
                            /* just a typeguard */ return (
                                meta.thing.value.thing_privileges.read ===
                                    "*" ||
                                meta.thing.value.thing_privileges.read.includes(
                                    user_id
                                )
                            )
                        }
                    }
                }
            }
        })
        .map((i) => i.thing_id)
}
export function new_transaction_privileges_check(
    user_id: number,
    thing_id: number | undefined,
    transactions: transaction[],
    transaction_diff: rdiff.rdiffResult[]
): boolean {
    var cache = calc_cache(transactions, undefined)
    /* returns whether the user has privilege of doing specified "job" to that thing */
    if (user_id === -1) return true /* task is being done by system */

    if (typeof thing_id === "undefined") {
        var tmp = {}
        rdiff.applyDiff(tmp, transaction_diff)
        function is_thing_meta(thing: any): thing is meta {
            return "type" in thing && thing.type === "meta"
        }
        if (is_thing_meta(tmp)) {
            if ("locks" in tmp.value) {
                //its a thing lock
                var thing_first_transaction = transactions.filter((i) => {
                    if (is_thing_meta(tmp) && "locks" in tmp.value) {
                        return i.thing_id === tmp.value.thing_id
                    }
                })[0]
                return thing_first_transaction.user_id === user_id
            } else {
                //its a file_lock
                return user_id === undefined
            }
        } else {
            return true
        }
    }

    var targeted_thing_cache_item = cache.find((i) => i.thing_id === thing_id)
    if (targeted_thing_cache_item !== undefined) {
        function is_cache_item_meta(
            cache_item: cache_item
        ): cache_item is { thing_id: number; thing: meta } {
            return cache_item.thing.type === "meta"
        }
        if (is_cache_item_meta(targeted_thing_cache_item)) {
            //a request wants to modify a meta
            var modified_fields: { [key: string]: boolean } = {}
            for (var key in [
                "thing_privileges",
                "locks",
                "modify_thing_privileges",
                "thing_id",
                "file_id",
                "file_privileges",
                "modify_privileges",
            ]) {
                modified_fields[key] = transaction_diff.some(
                    (i) => i.path[0] === "value" && i.path[1] === key
                )
            }
            if ("locks" in targeted_thing_cache_item.thing.value) {
                if (modified_fields.thing_id === true) return false
                if (modified_fields.locks === true) {
                    if (
                        targeted_thing_cache_item.thing.value.thing_privileges
                            .write !== "*" &&
                        !targeted_thing_cache_item.thing.value.thing_privileges.write.includes(
                            user_id
                        )
                    )
                        return false
                }
                if (
                    modified_fields.modify_thing_privileges === true ||
                    modified_fields.thing_privileges === true
                ) {
                    if (
                        targeted_thing_cache_item.thing.value
                            .modify_thing_privileges !== user_id
                    )
                        return false
                }
            } else {
                if (modified_fields.file_id) {
                    return false
                }
                if (
                    modified_fields.file_privileges &&
                    targeted_thing_cache_item.thing.value.modify_privileges !==
                        user_id
                ) {
                    return false
                }
                if (
                    modified_fields.modify_privileges &&
                    targeted_thing_cache_item.thing.value.modify_privileges !==
                        user_id
                ) {
                    return false
                }
            }

            return true
        } else {
            var assosiated_meta = cache.find(
                (i) =>
                    i.thing.type === "meta" &&
                    "locks" in i.thing.value &&
                    i.thing.value.thing_id === thing_id
            )

            if (
                assosiated_meta !== undefined &&
                is_cache_item_meta(assosiated_meta) &&
                "locks" in assosiated_meta.thing.value
            ) {
                return (
                    assosiated_meta.thing.value.thing_privileges.write ===
                        "*" ||
                    assosiated_meta.thing.value.thing_privileges.write.includes(
                        user_id
                    )
                )
            }
        }
    }
    return false
}
export function resolve_thing(
    transactions: transaction[],
    thing_id: number,
    snapshot: number | undefined
): thing {
    var unresolved_cache: cache = JSON.parse(
        JSON.stringify(calc_unresolved_cache(transactions, snapshot))
    )
    var thing = unresolved_cache.filter((i) => i.thing_id === thing_id)[0].thing

    for (var path of calc_all_paths(thing)) {
        //path in regex must not start or end with / -> valid example : prop1/prop2/prop3
        var regex_result =
            /^\$\$ref:(?<snapshot>[0-9]*):(?<thing_id>[0-9]*):*(?<path>(.*))$/.exec(
                resolve_path(thing, path)
            )
        if (
            regex_result &&
            regex_result.groups !== undefined &&
            "thing_id" in regex_result.groups &&
            "snapshot" in regex_result.groups
        ) {
            var ref_is_available = transactions.some((i) => {
                if (
                    regex_result?.groups?.thing_id !== undefined &&
                    i.thing_id === Number(regex_result.groups.thing_id)
                ) {
                    return true
                }
            })
            var path_last_part = path.at(-1)
            if (path_last_part !== undefined) {
                if (ref_is_available === true) {
                    var t = resolve_thing(
                        transactions,
                        Number(regex_result.groups.thing_id),
                        regex_result.groups.snapshot === ""
                            ? undefined
                            : Number(regex_result.groups.snapshot)
                    )
                    if (
                        "path" in regex_result.groups &&
                        regex_result.groups.path
                    ) {
                        resolve_path(thing, path.slice(0, -1))[path_last_part] =
                            resolve_path(t, regex_result.groups.path.split("/"))
                    } else {
                        resolve_path(thing, path.slice(0, -1))[path_last_part] =
                            t
                    }
                } else {
                    resolve_path(thing, path.slice(0, -1))[path_last_part] =
                        "ref_not_available"
                }
            }
        }
    }

    return thing
}
export function calc_cache(
    transactions: transaction[],
    snapshot: undefined | number
) {
    var unresolved_cache = calc_unresolved_cache(transactions, snapshot)
    var resolved_cache: cache = JSON.parse(JSON.stringify(unresolved_cache))
    /* resolving refs and adding meta if that exists */
    for (var cache_item of resolved_cache) {
        cache_item.thing = resolve_thing(
            transactions,
            cache_item.thing_id,
            snapshot
        )
    }
    for (var cache_item of resolved_cache) {
        cache_item.its_meta_cache_item = resolved_cache.find(
            (i) =>
                i.thing.type === "meta" &&
                "thing_id" in i.thing.value &&
                i.thing.value.thing_id === cache_item.thing_id
        )
    }

    return resolved_cache
}
export function calc_unresolved_cache(
    transactions: transaction[],
    snapshot: number | undefined
): cache {
    /* calculating unresolved cache  */
    return unique_items_of_array(
        transactions
            .filter((i) => (snapshot === undefined ? true : i.id <= snapshot))
            .map((i) => i.thing_id)
    ).map((thing_id: number) =>
        calc_unresolved_thing(transactions, thing_id, snapshot)
    )
}
export function calc_unresolved_thing(
    transactions: transaction[],
    thing_id: number,
    snapshot: number | undefined
) {
    var cache_item = { thing_id, thing: {} }
    for (var transaction of transactions.filter(
        (i) =>
            i.thing_id === thing_id &&
            (snapshot === undefined ? true : i.id <= snapshot)
    )) {
        rdiff.applyDiff(cache_item.thing, custom_deepcopy(transaction.diff))
    }
    return cache_item
}
export function rdiff_path_to_lock_path_format(
    rdiff_path: rdiff.rdiffResult["path"]
) {
    var result = []
    for (var item of rdiff_path) {
        if (typeof item === "number") {
            break
        } else {
            result.push(item)
        }
    }
    return result
}
export function simple_arrays_are_identical(
    array1: (string | number)[],
    array2: (string | number)[]
) {
    if (array1.length !== array2.length) {
        return false
    }
    for (var i = 0; i < array2.length; i++) {
        if (array1[i] !== array2[i]) {
            return false
        }
    }
    return true
}
export function extract_user_id(jwt: string): number {
    var decoded_jwt = jwtDecode(jwt)
    if (
        decoded_jwt !== null &&
        typeof decoded_jwt === "object" &&
        "user_id" in decoded_jwt
    ) {
        var v = decoded_jwt.user_id

        if (typeof v === "number") {
            return v
        } else {
            throw "extracted user_id has an invalid type."
        }
    } else {
        throw "failed to get user_id from jwt token"
    }
}
export function find_thing_meta(cache: cache, thing_id: number) {
    return cache.find(
        (i) =>
            i.thing.type === "meta" &&
            "thing_id" in i.thing.value &&
            i.thing.value.thing_id === thing_id
    )
}
export function find_unit_parents(cache: cache, thing_id: number) {
    var parents = [] // it is sorted from nearest parent to farthest
    var search_cursor = thing_id
    while (true) {
        var t = find_thing_meta(cache, search_cursor)
        if (
            t !== undefined &&
            "pack_id" in t.thing.value &&
            t.thing.value.pack_id
        ) {
            search_cursor = t.thing.value.pack_id
            parents.push(search_cursor)
        } else {
            break
        }
    }
    return parents
}

export function reserved_value_is_used(transactions: transaction[]) {
    //some values and patterns can set to be forbidden to exist in unresovled cache.
    for (var cache_item of calc_unresolved_cache(transactions, undefined)) {
        for (var path of calc_all_paths(cache_item)) {
            if (resolve_path(cache_item, path) === "ref_not_available") {
                return true
            }
        }
    }
    return false
}
export function calc_complete_transaction_diff(
    transactions: transaction[],
    transaction_id: number
): complete_diff {
    var transaction = transactions.find((tr) => tr.id === transaction_id)
    if (transaction === undefined)
        throw "internal Error! transaction does not exist with that id"
    var thing_id = transaction.thing_id
    var thing_before_change: undefined | object
    if (
        transactions.find(
            (tr) => tr.thing_id === thing_id && tr.id < transaction_id
        ) !== undefined
    ) {
        thing_before_change = calc_unresolved_thing(
            transactions,
            thing_id,
            transaction_id - 1
        ).thing
    } else {
        thing_before_change = undefined
    }

    var thing_after_change = calc_unresolved_thing(
        transactions,
        thing_id,
        transaction_id
    ).thing

    return custom_find_unique(
        [
            ...calc_all_paths(thing_before_change),
            ...calc_all_paths(thing_after_change),
        ],
        (i1: string[], i2: string[]) => simple_arrays_are_identical(i1, i2)
    ).map((path) => {
        var t = path as string[]
        return {
            path: t,
            before: resolve_path(thing_before_change, path),
            after: resolve_path(thing_after_change, path),
        }
    })
}
export interface TransactionInterpreterTypes {
    all_patterns: (() => void | {
        short: string
        verbose: string
    })[]
}
export class TransactionInterpreter implements TransactionInterpreterTypes {
    tr: transaction
    all_patterns = [
        () => {
            var change = this.find_change("value", "email_is_verified")
            if (change !== undefined) {
                return {
                    short:
                        change.after === true
                            ? `email was verified`
                            : `email is not verified anymore`,
                    verbose: `verbose mode is not added.`,
                }
            }
        },
        () => {
            var change = this.find_change("value", "mobile_is_verified")
            if (change !== undefined) {
                return {
                    short:
                        change.after === true
                            ? `mobile was verified`
                            : `mobile is not verified anymore`,
                    verbose: `verbose mode is not added.`,
                }
            }
        },
        () => {
            var change = this.find_change("type")
            if (change !== undefined && change.before === undefined) {
                return {
                    short: `this "${change.after}" was created`,
                    verbose: "verbose mode is not supported yet",
                }
            }
        },
        ...["password", "email_address", "mobile"].map((key) => () => {
            var change = this.find_change("value", key)
            if (change !== undefined) {
                return {
                    short: `${key} pointer changed : now points to ${change.after}`,
                    verbose: "verbose mode is not supported yet",
                }
            }
        }),
        ...["title", "description"].map((key) => () => {
            var change = this.find_change("value", key)
            if (change !== undefined) {
                return {
                    short: `${key} of this thing changed to ${change.after}`,
                    verbose: "verbose mode is not supported yet",
                }
            }
        }),
        () => {
            var change = this.find_change("value", "text")
            if (
                change !== undefined &&
                "type" in this.cache_item_after_change.thing &&
                this.cache_item_after_change.thing.type === "message"
            ) {
                return {
                    short: `text of this message was changed to ${change.after}`,
                    verbose: `verbose mode is not supported yet`,
                }
            }
        },
        () => {
            var change = this.find_change("value", "data")
            if (
                change !== undefined &&
                "type" in this.cache_item_after_change.thing &&
                this.cache_item_after_change.thing.type === "unit/note"
            ) {
                return {
                    short: "content of this note was changed",
                    verbose: "verbose mode is not supproted",
                }
            }
        },
    ]
    get matching_patterns_results() {
        var results: { short: string; verbose: string }[] = []
        this.all_patterns.forEach((patt) => {
            var result = patt()
            if (result !== undefined) {
                results.push(result)
            }
        })
        return results
    }
    get complete_diff() {
        return calc_complete_transaction_diff(this.transactions, this.tr.id)
    }
    transactions: transaction[]
    constructor(transactions: transaction[], tr_id: number) {
        this.transactions = transactions
        var t = transactions.find((tr) => tr.id === tr_id)
        if (t === undefined)
            throw "there is not any transaction with that id to interpret."
        this.tr = t
    }
    get cache_item_before_change() {
        return calc_unresolved_thing(
            this.transactions,
            this.tr.thing_id,
            this.tr.id - 1
        )
    }
    get cache_item_after_change() {
        return calc_unresolved_thing(
            this.transactions,
            this.tr.thing_id,
            this.tr.id
        )
    }
    find_change(...path: string[]) {
        var t = calc_complete_transaction_diff(
            this.transactions,
            this.tr.id
        ).filter((complete_diff_item) => {
            return (
                simple_arrays_are_identical(
                    [complete_diff_item.before],
                    [complete_diff_item.after]
                ) === false
            )
        })
        var wanted_diff = t.find((i) =>
            simple_arrays_are_identical(i.path, path)
        )
        if (wanted_diff === undefined) {
            return undefined
        }
        return {
            path,
            before: wanted_diff.before,
            after: wanted_diff.after,
        }
    }
}
export function flexible_user_finder(
    cache: cache_item[],
    identifier: string
): number | undefined /* (no match) */ {
    var tmp: any = cache.filter(
        (item: cache_item) => item.thing.type === "user"
    )
    var all_values: string[] = []
    tmp.forEach((item: any) => {
        all_values.push(
            ...[
                item.thing.value.mobile,
                item.thing.value.email_address,
                item.thing_id,
            ].filter((i) => i !== undefined && i !== null)
        )
    })
    var matches_count = all_values.filter((value) => value == identifier).length
    if (matches_count === 0) {
        return undefined
    } else if (matches_count === 1) {
        var matched_user = tmp.find((item: any) => {
            return (
                [
                    item.thing.value.mobile,
                    item.thing.value.email_address,
                    item.thing_id,
                ].find((i) => i == identifier) !== undefined
            )
        })

        return matched_user.thing_id
    } else {
        throw "there is more than one match in valid search resources"
    }
}
export function getRandomSubarray<T>(arr: T[], size: number): T[] {
    //this function was copied from stackoverflow
    var shuffled = arr.slice(0),
        i = arr.length,
        temp,
        index
    while (i--) {
        index = Math.floor((i + 1) * Math.random())
        temp = shuffled[index]
        shuffled[index] = shuffled[i]
        shuffled[i] = temp
    }
    return shuffled.slice(0, size)
}