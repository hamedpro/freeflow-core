import rdiff, { applyDiff } from "recursive-diff";
import { unique_items_of_array } from "../common_helpers";
import { cache, cache_item, locks, meta, thing, transaction } from "./UnifiedHandler_types";

export function all_paths(object: object) {
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
		all_paths({
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
			(i: cache_item) => i.thing.type === "meta" && i.thing.value.thing_id === thing_id
		);
		if (meta === undefined) {
			throw "meta was not found for this this. create it first.";
		} else {
			if ("locks" in meta.thing.value) {
				for (var path of paths) {
					var tmp = resolve_path(meta.thing.value.locks, path);
					if (tmp !== undefined && tmp !== user_id) {
						return false;
					}
				}
				return true;
			}
		}
	}

	return false;
}
export function calc_user_discoverable_things(cache: cache, user_id: number): number[] {
	return cache
		.filter((i) => {
			if (i.thing.type === "meta") {
				return true;
			} else {
				var meta = cache.filter((j) => {
					return j.thing.type === "meta" && j.thing.value.thing_id === i.thing_id;
				})[0];
				function is_meta(
					cache_item: cache_item
				): cache_item is { thing_id: number; thing: meta } {
					return cache_item.thing.type === "meta";
				}
				if (is_meta(meta)) {
					/* just a typeguard */ return (
						meta.thing.value.thing_privileges.read === "*" ||
						meta.thing.value.thing_privileges.read.includes(user_id)
					);
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
			var thing_first_transaction = transactions.filter((i) => {
				if (is_thing_meta(tmp)) {
					i.thing_id === tmp.value.thing_id;
				}
			})[0];
			return thing_first_transaction.user_id === user_id;
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
			for (var key in ["thing_privileges", "locks", "modify_thing_privileges", "thing_id"]) {
				modified_fields[key] = transaction_diff.some(
					(i) => i.path[0] === "value" && i.path[1] === key
				);
			}
			if (modified_fields.thing_id === true) return false;
			if (modified_fields.locks === true) {
				if (
					targeted_thing_cache_item.thing.value.thing_privileges.write !== "*" &&
					!targeted_thing_cache_item.thing.value.thing_privileges.write.includes(user_id)
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
			return true;
		} else {
			var assosiated_meta = cache.find(
				(i) => i.thing.type === "meta" && i.thing.value.thing_id === thing_id
			);

			if (assosiated_meta !== undefined && is_cache_item_meta(assosiated_meta)) {
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
	var result: cache = JSON.parse(JSON.stringify(calc_cache(transactions, snapshot)));
	var thing = result.filter((i) => i.thing_id === thing_id)[0].thing;

	for (var path of all_paths(thing)) {
		path.forEach((path_part, index, array) => {
			var regex_result = /^\$\$ref:(?<snapshot>[0-9]*):(?<thing_id>[0-9]*)$/.exec(path_part);
			if (regex_result) {
				if (
					regex_result.groups !== undefined &&
					"thing_id" in regex_result.groups &&
					"snapshot" in regex_result.groups
				) {
					resolve_path(thing, array.slice(0, index - 1))[path_part] = resolve_thing(
						transactions,
						Number(regex_result.groups.thing_id),
						Number(regex_result.groups.snapshot)
					);
				}
			}
		});
	}

	return thing;
}
export function calc_cache(transactions: transaction[], snapshot: number | undefined): cache {
	/* calculating unresolved cache  */
	var cache = unique_items_of_array(
		transactions
			.filter((i) => (snapshot === undefined ? true : i.id <= snapshot))
			.map((i) => i.thing_id)
	).map((thing_id: number) => calc_thing(transactions, thing_id, snapshot));

	//maybe need to deep clone cache  here

	/* resolving refs  */
	for (var cache_item of cache) {
		cache_item.thing = resolve_thing(transactions, cache_item.thing_id, snapshot);
	}
	return cache;
}
export function calc_thing(
	transactions: transaction[],
	thing_id: number,
	snapshot: number | undefined
) {
	var cache_item = { thing_id, thing: {} };
	for (var transaction of transactions.filter(
		(i) => i.thing_id === thing_id && (snapshot === undefined ? true : i.id <= snapshot)
	)) {
		applyDiff(cache_item.thing, transaction.diff);
	}
	return cache_item;
}
export function rdiff_path_to_lock_path_format(rdiff_path: rdiff.rdiffResult["path"]) {
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
