//read README file : UnifiedHandlerSystem.md

import { cache_item, meta, transaction } from "./UnifiedHandler_types.js";
import {
	calc_cache,
	calc_unresolved_cache,
	calc_user_discoverable_things,
	check_lock,
	new_transaction_privileges_check,
	thing_transactions,
} from "./utils.js";

export class UnifiedHandlerCore {
	thing_transactions = (thing_id: number) => thing_transactions(this.transactions, thing_id);
	find_first_transaction = (thing_id: number) => this.thing_transactions(thing_id)[0];

	calc_user_discoverable_things = (user_id: number) =>
		calc_user_discoverable_things(this.transactions, this.cache, user_id);

	calc_user_discoverable_transactions = (user_id: number) =>
		this.calc_user_discoverable_things(user_id)
			.map((thing_id) => this.thing_transactions(thing_id))
			.flat();
	find_thing_meta(thing_id: number) {
		return this.cache.find(
			(i) =>
				i.thing.type === "meta" &&
				"thing_id" in i.thing.value &&
				i.thing.value.thing_id === thing_id
		);
	}
	new_transaction_privileges_check = new_transaction_privileges_check;

	check_lock = check_lock;

	onChanges: { transactions: () => void; cache: () => void; time_travel_snapshot: () => void } = {
		transactions: () => {},
		cache: () => {},
		time_travel_snapshot: () => {},
	};

	time_travel_snapshot: number | undefined;

	time_travel(snapshot: number | undefined) {
		this.time_travel_snapshot = snapshot;
		this.onChanges.time_travel_snapshot();
		this.onChanges.cache();
	}

	transactions: transaction[] = [];

	get cache(): cache_item[] {
		return calc_cache(this.transactions, this.time_travel_snapshot);
	}
	get unresolved_cache() {
		return calc_unresolved_cache(this.transactions, this.time_travel_snapshot);
	}
}
