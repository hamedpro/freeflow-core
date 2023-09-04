import { cache_item, core_thing, time_travel_snapshot, transaction } from "./UnifiedHandler_types.js";
import { check_lock, new_transaction_privileges_check, extract_user_id } from "./utils.js";
export declare class UnifiedHandlerCore {
    calc_user_discoverable_files(user_id: number): number[];
    thing_transactions: (thing_id: number) => transaction[];
    find_first_transaction: (thing_id: number) => transaction;
    calc_user_discoverable_things: (user_id: number) => number[];
    calc_user_discoverable_transactions: (user_id: number) => transaction[];
    find_thing_meta: (thing_id: number) => cache_item<core_thing> | undefined;
    apply_max_sync_depth(transactions: transaction[], max_sync_depth: number | undefined): transaction[];
    new_transaction_privileges_check: typeof new_transaction_privileges_check;
    extract_user_id: typeof extract_user_id;
    check_lock: typeof check_lock;
    onChange: () => void;
    find_user_private_data_id(user_id: number): number;
    time_travel_snapshot: time_travel_snapshot;
    time_travel(snapshot: time_travel_snapshot): void;
    transactions: transaction[];
    get cache(): cache_item[];
    get unresolved_cache(): import("./UnifiedHandler_types.js").cache;
}
