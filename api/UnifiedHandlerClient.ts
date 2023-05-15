import { io } from "socket.io-client";
import { surface_cache_item, transaction } from "./UnifiedHandler_types";
import axios from "axios";
import rdiff from "recursive-diff";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore";
import { unique_items_of_array } from "../common_helpers";
var { applyDiff } = rdiff;

export class UnifiedHandlerClient extends UnifiedHandlerCore {
	websocket: ReturnType<typeof io>;
	configured_axios: ReturnType<typeof axios.create>;
	time_travel_snapshot_onchange: () => void = () => {};
	discoverable_transactions: transaction[] = [];
	_time_travel_snapshot: undefined | number;
	set time_travel_snapshot(new_time_travel_snapshot: number | undefined) {
		this._time_travel_snapshot = new_time_travel_snapshot;
		this.time_travel_snapshot_onchange();
	}
	get time_travel_snapshot() {
		return this._time_travel_snapshot;
	}
	/* transaction_id (undef behaves just like max transaction_id
	of discoverable_transactions  ) */

	get current_surface_cache(): surface_cache_item[] {
		return this.calc_surface_cache(this.time_travel_snapshot);
	}

	/* it is prefixed with current because unlike discoverable_transactions
	this doesnt necessarily contain latest data. it tracks time_travel_snapshot
	and also contains surface_cache of data up to that 
	(if time_travel_snapshot equals undefined it contains surface 
	cache of all discoverable_transactions) */

	constructor(websocket_api_endpoint: string, restful_api_endpoint: string) {
		console.log("a new uhclient is created ");
		super();
		this._time_travel_snapshot = undefined;
		this.configured_axios = axios.create({
			baseURL: restful_api_endpoint,
		});
		this.websocket = io(websocket_api_endpoint);
		this.websocket.on("syncing_discoverable_transactions", (args: rdiff.rdiffResult[]) => {
			applyDiff(this.discoverable_transactions, args);
			this.discoverable_transactions_onchange();
		});
	}

	auth(jwt: string) {
		this.websocket.emit("jwt", jwt);
	}
	//todo when discoverable transactions are
	// not fetched (at the first time) we must
	// have it equal to undefined instead of []
	// catch websocket errors and disconnects
	async request_new_transaction() {}
}
