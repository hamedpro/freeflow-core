//read README file : UnifiedHandlerSystem.md

import { custom_find_unique } from "../common_helpers.js"
import {
    cache_item,
    thing,
    time_travel_snapshot,
    transaction,
    user,
} from "./UnifiedHandler_types.js"
import {
    calc_cache,
    calc_unresolved_cache,
    calc_user_discoverable_things,
    check_lock,
    new_transaction_privileges_check,
    thing_transactions,
    extract_user_id,
    find_thing_meta,
} from "./utils.js"

export class UnifiedHandlerCore {
    calc_user_discoverable_files(user_id: number): number[] {
        var results: number[] = []

        this.cache.forEach((ci) => {
            if (
                ci.thing.type === "meta" &&
                "file_id" in ci.thing.value &&
                "file_privileges" in ci.thing.value &&
                (ci.thing.value.file_privileges.read === "*" ||
                    ci.thing.value.file_privileges.read.includes(user_id))
            ) {
                results.push(ci.thing_id)
            }
        })

        return results
    }
    thing_transactions = (thing_id: number) =>
        thing_transactions(this.transactions, thing_id)
    find_first_transaction = (thing_id: number) =>
        this.thing_transactions(thing_id)[0]

    calc_user_discoverable_things = (user_id: number) =>
        calc_user_discoverable_things(this.transactions, this.cache, user_id)

    calc_user_discoverable_transactions = (user_id: number) =>
        this.calc_user_discoverable_things(user_id)
            .map((thing_id) => this.thing_transactions(thing_id))
            .flat()
    find_thing_meta = (thing_id: number) =>
        find_thing_meta(this.cache, thing_id)
    apply_max_sync_depth(
        transactions: transaction[],
        max_sync_depth: number | undefined
    ): transaction[] {
        if (max_sync_depth === undefined) {
            return transactions
        }
        var result: transaction[] = []
        custom_find_unique(transactions.map((tr) => tr.thing_id)).forEach(
            (unique_thing_id: number) => {
                var clone = transactions.filter(
                    (tr) => tr.thing_id === unique_thing_id
                )
                clone.reverse()
                result.push(...clone.slice(0, max_sync_depth))
            }
        )
        result.sort((tr1, tr2) => tr1.id - tr2.id)
        return result
    }
    new_transaction_privileges_check = new_transaction_privileges_check
    extract_user_id = extract_user_id
    check_lock = check_lock

    onChange: () => void = () => {}
    find_user_private_data_id(user_id: number): number {
        var user: cache_item<thing> | undefined = this.unresolved_cache.find(
            (ci) => ci.thing_id === user_id
        )
        if (user === undefined) {
            throw "was trying to find usr private data : user could not be found"
        } else {
            if (user.thing.type !== "user") {
                throw "internal error. given user id doesnt belong a user"
            } else {
                return Number(user.thing.value.password.split(":")[2])
            }
        }
    }
    time_travel_snapshot: time_travel_snapshot

    time_travel(snapshot: time_travel_snapshot) {
        this.time_travel_snapshot = snapshot
        this.onChange()
    }

    transactions: transaction[] = []

    get cache(): cache_item<thing>[] {
        return calc_cache(this.transactions, this.time_travel_snapshot)
    }
    get unresolved_cache() {
        return calc_unresolved_cache(
            this.transactions,
            this.time_travel_snapshot
        )
    }
}
