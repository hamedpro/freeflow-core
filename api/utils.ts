import rdiff from "recursive-diff";
import { unique_items_of_array } from "../common_helpers.js";
import { cache, cache_item, locks, meta, thing, transaction } from "./UnifiedHandler_types.js";
export function custom_deepcopy(value: any) {
	return JSON.parse(JSON.stringify(value));
}
export function calc_all_paths(object: object) {
	var results: string[][] = [];
	function make_path(object: any, base: string[]) {
		for (var key in object) {
			var t = typeof object[key];
			if (t === "number" || t === "string" || Array.isArray(object[key])) {
				results.push(base.concat(key));
			} else {
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
var test1 = () =>
	console.log(
		calc_all_paths({
			name: "hamed",
			interests: {
				coding: 90,
				sleep: 60,
				k: {
					negin: [1, 2, 3, 4],
				},
			},
		})
	);

export function resolve_path(object: any, paths: string[]) {
	if (paths.length === 0) {
		return undefined;
	}
	var result = object[paths[0]];
	for (var i = 1; i < paths.length; i++) {
		result = result[paths[i]];
	}
	return result;
}
export function validate_lock_structure(locks: locks) {
	for (var lock of locks) {
		if (lock.value === undefined) {
			continue;
		}
		for (var lock2 of locks.filter((i) => {
			if (!(lock.path.length < i.path.length)) {
				return false;
			}
			for (var index in lock.path) {
				if (lock.path[index] !== i.path[index]) {
					return false;
				}
			}
			return true;
		})) {
			if (lock2.value !== lock.value) {
				return false;
			}
		}
	}
	return true;
}
export function validate_refs_values(thing: thing) {
	var all_paths = calc_all_paths(thing);
	for (var path of all_paths) {
		for (var i = 0; i < path.length; i++) {
			if (/^\$(.*)$/.exec(path[i])) {
				if (
					/^\$\$ref:(?<snapshot>[0-9]*):(?<thing_id>[0-9]*)$/.exec(
						resolve_path(thing, path.slice(0, i + 1))
					) === null
				) {
					return false;
				}
			}
		}
	}
	return true;
}
export function thing_transactions(transactinos: transaction[], thing_id: number) {
	return transactinos.filter((i) => i.thing_id === thing_id);
}
export function check_lock({
	user_id,
	thing_id,
	cache,
	paths,
}: {
	thing_id: number | undefined;
	user_id: number | undefined;
	cache: cache;
	paths: string[][]; // patchs you want to check if are locked or not
}): boolean {
	//returns true if its not locked or is used for passed user
	if (thing_id === undefined) return true;

	var item = cache.find((i) => i.thing_id === thing_id);

	if (item?.thing.type === "meta") {
		return true;
	} else {
		var meta = cache.find(
			(i: cache_item) =>
				i.thing.type === "meta" &&
				"locks" in i.thing.value &&
				i.thing.value.thing_id === thing_id
		);
		if (meta === undefined) {
			throw "meta was not found for this this. create it first.";
		} else {
			if ("locks" in meta.thing.value) {
				for (var path of paths) {
					var tmp = meta.thing.value.locks.find((i) =>
						simple_arrays_are_identical(i.path, path)
					);

					if (tmp !== undefined && tmp.value !== undefined && tmp.value !== user_id) {
						return false;
					}
				}
				return true;
			}
		}
	}

	return false;
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
				return true;
			} else {
				var meta = cache.find((j) => {
					return (
						j.thing.type === "meta" &&
						"locks" in j.thing.value &&
						j.thing.value.thing_id === i.thing_id
					);
				});
				if (meta === undefined) {
					return user_id === thing_transactions(transactions, i.thing_id)[0].user_id;
				} else {
					function is_meta(
						cache_item: cache_item
					): cache_item is { thing_id: number; thing: meta } {
						return cache_item.thing.type === "meta";
					}
					if (is_meta(meta)) {
						if ("locks" in meta.thing.value) {
							/* just a typeguard */ return (
								meta.thing.value.thing_privileges.read === "*" ||
								meta.thing.value.thing_privileges.read.includes(user_id)
							);
						}
					}
				}
			}
		})
		.map((i) => i.thing_id);
}
export function new_transaction_privileges_check(
	user_id: number | undefined,
	thing_id: number | undefined,
	transactions: transaction[],
	transaction_diff: rdiff.rdiffResult[]
): boolean {
	var cache = calc_cache(transactions, undefined);
	/* returns whether the user has privilege of doing specified "job" to that thing */
	if (user_id === undefined) return true; /* task is being done by system */

	if (typeof thing_id === "undefined") {
		var tmp = {};
		rdiff.applyDiff(tmp, transaction_diff);
		function is_thing_meta(thing: any): thing is meta {
			return "type" in thing && thing.type === "meta";
		}
		if (is_thing_meta(tmp)) {
			if ("locks" in tmp.value) {
				//its a thing lock
				var thing_first_transaction = transactions.filter((i) => {
					if (is_thing_meta(tmp) && "locks" in tmp.value) {
						return i.thing_id === tmp.value.thing_id;
					}
				})[0];
				return thing_first_transaction.user_id === user_id;
			} else {
				//its a file_lock
				return user_id === undefined;
			}
		} else {
			return true;
		}
	}

	var targeted_thing_cache_item = cache.find((i) => i.thing_id === thing_id);
	if (targeted_thing_cache_item !== undefined) {
		function is_cache_item_meta(
			cache_item: cache_item
		): cache_item is { thing_id: number; thing: meta } {
			return cache_item.thing.type === "meta";
		}
		if (is_cache_item_meta(targeted_thing_cache_item)) {
			//a request wants to modify a meta
			var modified_fields: { [key: string]: boolean } = {};
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
				);
			}
			if ("locks" in targeted_thing_cache_item.thing.value) {
				if (modified_fields.thing_id === true) return false;
				if (modified_fields.locks === true) {
					if (
						targeted_thing_cache_item.thing.value.thing_privileges.write !== "*" &&
						!targeted_thing_cache_item.thing.value.thing_privileges.write.includes(
							user_id
						)
					)
						return false;
				}
				if (
					modified_fields.modify_thing_privileges === true ||
					modified_fields.thing_privileges === true
				) {
					if (targeted_thing_cache_item.thing.value.modify_thing_privileges !== user_id)
						return false;
				}
			} else {
				if (modified_fields.file_id) {
					return false;
				}
				if (
					modified_fields.file_privileges &&
					targeted_thing_cache_item.thing.value.modify_privileges !== user_id
				) {
					return false;
				}
				if (
					modified_fields.modify_privileges &&
					targeted_thing_cache_item.thing.value.modify_privileges !== user_id
				) {
					return false;
				}
			}

			return true;
		} else {
			var assosiated_meta = cache.find(
				(i) =>
					i.thing.type === "meta" &&
					"locks" in i.thing.value &&
					i.thing.value.thing_id === thing_id
			);

			if (
				assosiated_meta !== undefined &&
				is_cache_item_meta(assosiated_meta) &&
				"locks" in assosiated_meta.thing.value
			) {
				return (
					assosiated_meta.thing.value.thing_privileges.write === "*" ||
					assosiated_meta.thing.value.thing_privileges.write.includes(user_id)
				);
			}
		}
	}
	return false;
}
export function resolve_thing(
	transactions: transaction[],
	thing_id: number,
	snapshot: number | undefined
): thing {
	var unresolved_cache: cache = JSON.parse(
		JSON.stringify(calc_unresolved_cache(transactions, snapshot))
	);
	var thing = unresolved_cache.filter((i) => i.thing_id === thing_id)[0].thing;

	for (var path of calc_all_paths(thing)) {
		var last_path_part = path.at(-1);

		if (last_path_part !== undefined && /^\$(.*)$/.exec(last_path_part)) {
			var regex_result = /^\$\$ref:(?<snapshot>[0-9]*):(?<thing_id>[0-9]*)$/.exec(
				resolve_path(thing, path)
			);
			if (
				regex_result &&
				regex_result.groups !== undefined &&
				"thing_id" in regex_result.groups &&
				"snapshot" in regex_result.groups
			) {
				var user_has_access_to_ref = transactions.some((i) => {
					if (
						regex_result?.groups?.thing_id !== undefined &&
						i.thing_id === Number(regex_result.groups.thing_id)
					) {
						return true;
					}
				});

				resolve_path(thing, path.slice(0, -1))[last_path_part] = user_has_access_to_ref
					? resolve_thing(
							transactions,
							Number(regex_result.groups.thing_id),
							regex_result.groups.snapshot === ""
								? undefined
								: Number(regex_result.groups.snapshot)
					  )
					: undefined;
			}
		}
	}

	return thing;
}
export function calc_cache(transactions: transaction[], snapshot: undefined | number) {
	var unresolved_cache = calc_unresolved_cache(transactions, snapshot);
	var resolved_cache: cache = JSON.parse(JSON.stringify(unresolved_cache));
	/* resolving refs  */
	for (var cache_item of resolved_cache) {
		cache_item.thing = resolve_thing(transactions, cache_item.thing_id, snapshot);
	}
	return resolved_cache;
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
	).map((thing_id: number) => calc_unresolved_thing(transactions, thing_id, snapshot));
}
export function calc_unresolved_thing(
	transactions: transaction[],
	thing_id: number,
	snapshot: number | undefined
) {
	//todo check here if that thing even exists
	var cache_item = { thing_id, thing: {} };
	for (var transaction of transactions.filter(
		(i) => i.thing_id === thing_id && (snapshot === undefined ? true : i.id <= snapshot)
	)) {
		rdiff.applyDiff(cache_item.thing, custom_deepcopy(transaction.diff));
	}
	return cache_item;
}
export function rdiff_path_to_lock_path_format(rdiff_path: rdiff.rdiffResult["path"]) {
	//todo make sure numbers only are used as array indexes
	var result = [];
	for (var item of rdiff_path) {
		if (typeof item === "number") {
			break;
		} else {
			result.push(item);
		}
	}
	return result;
}
export function simple_arrays_are_identical(
	array1: (string | number)[],
	array2: (string | number)[]
) {
	if (array1.length !== array2.length) {
		return false;
	}
	for (var i = 0; i < array2.length; i++) {
		if (array1[i] !== array2[i]) {
			return false;
		}
	}
	return true;
}
