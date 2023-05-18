import { io } from "socket.io-client";
import { surface_cache_item, transaction } from "./UnifiedHandler_types";
import axios from "axios";
import rdiff from "recursive-diff";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore";
import { unique_items_of_array } from "../common_helpers";
var { applyDiff } = rdiff;

export class UnifiedHandlerClient extends UnifiedHandlerCore {
	websocket: ReturnType<typeof io>;

	time_travel_snapshot_onchange: () => void = () => {};
	discoverable_transactions: transaction[] = [];
	_time_travel_snapshot: undefined | number;
	websocket_api_endpoint: string;
	restful_api_endpoint: string;
	set time_travel_snapshot(new_time_travel_snapshot: number | undefined) {
		this._time_travel_snapshot = new_time_travel_snapshot;
		this.time_travel_snapshot_onchange();
	}
	get time_travel_snapshot() {
		return this._time_travel_snapshot;
	}
	get jwt() {
		return window.localStorage.getItem("jwt") ?? undefined;
	}
	get configured_axios(): ReturnType<typeof axios.create> {
		return axios.create({
			baseURL: this.restful_api_endpoint,
			headers: {
				jwt: this.jwt,
			},
		});
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
		super();
		this.websocket_api_endpoint = websocket_api_endpoint;
		this.restful_api_endpoint = restful_api_endpoint;
		//console.log("a new uhclient is created ");

		this._time_travel_snapshot = undefined;

		this.websocket = io(websocket_api_endpoint);
		this.websocket.on("syncing_discoverable_transactions", (args: rdiff.rdiffResult[]) => {
			applyDiff(this.discoverable_transactions, args);
			this.discoverable_transactions_onchange();
		});
	}

	auth() {
		this.websocket.emit("jwt", this.jwt);
	}
	// todo when discoverable transactions are
	// not fetched (at the first time) we must
	// have it equal to undefined instead of []
	// catch websocket errors and disconnects

	async request_new_transaction({
		new_thing_creator,
		thing_id,
	}: {
		thing_id: undefined | number;
		new_thing_creator: (current_thing: any) => any;
	}) {
		var thing =
			thing_id === undefined
				? {}
				: this.current_surface_cache.filter((i) => i.thing_id === thing_id)[0].thing;
		var response = await this.configured_axios({
			data: {
				diff: rdiff.getDiff(thing, new_thing_creator(thing)),
				thing_id,
			},
			method: "post",
			url: "/new_transaction",
		});
		return response.data;
	}
}
