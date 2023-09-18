import rdiff from "recursive-diff";
import { cache, cache_item, complete_diff, locks, profile, profile_seed, core_thing, thing_base, thing_privileges, time_travel_snapshot, transaction, user } from "./UnifiedHandler_types.js";
import axios from "axios";
import { io } from "socket.io-client";
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
export declare function new_transaction_privileges_check(user_id: number, thing_id: number | undefined, transactions: transaction[], transaction_diff: rdiff.rdiffResult[], cache: cache): boolean;
export declare function resolve_thing(transactions: transaction[], thing_id: number, snapshot: time_travel_snapshot): core_thing;
export declare function calc_cache(transactions: transaction[], snapshot: time_travel_snapshot): cache;
export declare function snapshot_filtered(transactions: transaction[], snapshot: time_travel_snapshot): transaction[];
export declare function calc_unresolved_cache(transactions: transaction[], snapshot: time_travel_snapshot): cache;
export declare function calc_unresolved_thing(transactions: transaction[]): cache_item<any>;
export declare function rdiff_path_to_lock_path_format(rdiff_path: rdiff.rdiffResult["path"]): string[];
export declare function simple_arrays_are_identical(array1: (string | number)[], array2: (string | number)[]): boolean;
export declare function extract_user_id(jwt: string): number;
export declare function find_thing_meta(cache: cache, thing_id: number): cache_item<core_thing> | undefined;
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
    get cache_item_before_change(): cache_item;
    get cache_item_after_change(): cache_item;
    find_change(...path: string[]): {
        path: string[];
        before: any;
        after: any;
    } | undefined;
}
export declare function flexible_user_finder(cache: cache_item[], identifier: string): number | undefined;
export declare function getRandomSubarray<T>(arr: T[], size: number): T[];
export declare function range_helper_compress(array: number[]): string;
export declare function range_helper_decompress(value: string): number[];
export declare function finder(transactions: transaction[], cache: cache, finder_query: string, user_id: number): cache_item<core_thing>[];
export declare function sorted(array: Array<any>): any[];
export declare function getDaysArray(start: Date, end: Date): Date[];
export declare function find_active_profile(profiles: profile[]): profile | undefined;
export declare function find_active_profile_seed(profiles_seed: profile_seed[]): profile_seed | undefined;
export declare function current_user_id(profiles_seed: profile_seed[]): number;
export declare function create_configured_axios({ restful_api_endpoint, jwt, }: {
    restful_api_endpoint: string;
    jwt?: string;
}): ReturnType<typeof axios.create>;
export declare function sync_profiles_seed(websocket: ReturnType<typeof io>, profiles_seed: profile_seed[]): void;
export declare function sync_cache(websocket: ReturnType<typeof io>, all_transactions: transaction[]): Promise<void>;
export declare function user_discoverable_transactions(profiles: profile[], all_transactions: transaction[]): transaction[];
export declare function current_user(cache: cache, profiles_seed: profile_seed[]): cache_item<user> | undefined;
export declare function request_new_transaction({ new_thing_creator, thing_id, diff, unresolved_cache, restful_api_endpoint, jwt, }: {
    thing_id: undefined | number;
    new_thing_creator?: (current_thing: any) => any;
    diff?: rdiff.rdiffResult[];
    unresolved_cache: cache;
    restful_api_endpoint: string;
    jwt?: undefined | string;
}): Promise<any>;
export declare function request_new_thing({ value, unresolved_cache, restful_api_endpoint, current_profile, thing_privileges, }: {
    value: thing_base;
    current_profile: profile | undefined;
    unresolved_cache: cache;
    restful_api_endpoint: string;
    thing_privileges?: thing_privileges;
}): Promise<{
    meta_id?: number;
    thing_id: number;
}>;
export declare function calc_file_url(profiles_seed: profile_seed[], rest_endpoint: string, file_id: number): string;
