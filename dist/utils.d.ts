import rdiff from "recursive-diff";
import { cache, cache_item, complete_diff, locks, thing, time_travel_snapshot, transaction } from "./UnifiedHandler_types.js";
export declare function custom_deepcopy(value: any): any;
export declare function calc_all_paths(value: object | undefined): string[][];
export declare function resolve_path(object: any, paths: string[]): any;
export declare function validate_lock_structure(locks: locks): boolean;
export declare function thing_transactions(transactinos: transaction[], thing_id: number): transaction[];
export declare function check_lock({ user_id, thing_id, cache, paths, }: {
    thing_id: number | undefined;
    user_id: number;
    cache: cache;
    paths: string[][];
}): boolean;
export declare function calc_user_discoverable_things(transactions: transaction[], cache: cache, user_id: number): number[];
export declare function new_transaction_privileges_check(user_id: number, thing_id: number | undefined, transactions: transaction[], transaction_diff: rdiff.rdiffResult[]): boolean;
export declare function resolve_thing(transactions: transaction[], thing_id: number, snapshot: time_travel_snapshot): thing;
export declare function calc_cache(transactions: transaction[], snapshot: time_travel_snapshot): cache;
export declare function calc_unresolved_cache(transactions: transaction[], snapshot: time_travel_snapshot): cache;
export declare function calc_unresolved_thing(transactions: transaction[], thing_id: number, snapshot: time_travel_snapshot): cache_item<any>;
export declare function rdiff_path_to_lock_path_format(rdiff_path: rdiff.rdiffResult["path"]): string[];
export declare function simple_arrays_are_identical(array1: (string | number)[], array2: (string | number)[]): boolean;
export declare function extract_user_id(jwt: string): number;
export declare function find_thing_meta(cache: cache, thing_id: number): cache_item<thing> | undefined;
export declare function find_unit_parents(cache: cache, thing_id: number): number[];
export declare function reserved_value_is_used(transactions: transaction[]): boolean;
export declare function calc_complete_transaction_diff(transactions: transaction[], transaction_id: number): complete_diff;
export interface TransactionInterpreterTypes {
    all_patterns: (() => void | {
        short: string;
        verbose: string;
    })[];
}
export declare class TransactionInterpreter implements TransactionInterpreterTypes {
    tr: transaction;
    all_patterns: (() => {
        short: string;
        verbose: string;
    } | undefined)[];
    get matching_patterns_results(): {
        short: string;
        verbose: string;
    }[];
    get complete_diff(): complete_diff;
    transactions: transaction[];
    constructor(transactions: transaction[], tr_id: number);
    get cache_item_before_change(): cache_item<any>;
    get cache_item_after_change(): cache_item<any>;
    find_change(...path: string[]): {
        path: string[];
        before: any;
        after: any;
    } | undefined;
}
export declare function flexible_user_finder(cache: cache_item<thing>[], identifier: string): number | undefined;
export declare function getRandomSubarray<T>(arr: T[], size: number): T[];
export declare function range_helper_compress(array: number[]): string;
export declare function range_helper_decompress(value: string): number[];
export declare function finder(transactions: transaction[], cache: cache, finder_query: string, user_id: number): cache_item<thing>[];
export declare function sorted(array: Array<any>): any[];
export declare function getDaysArray(start: Date, end: Date): Date[];
