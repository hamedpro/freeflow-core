import jwtDecode from "jwt-decode";
import { io } from "socket.io-client";
import axios from "axios";
import rdiff from "recursive-diff";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore";
import { profile, profile_seed } from "./UnifiedHandler_types";
var { applyDiff } = rdiff;

export class UnifiedHandlerClient extends UnifiedHandlerCore {
	websocket: ReturnType<typeof io>;
	websocket_api_endpoint: string;
	restful_api_endpoint: string;
	profiles_seed: profile_seed[] = [];
	profiles: profile[] = [];
	constructor(
		websocket_api_endpoint: string,
		restful_api_endpoint: string,
		onChanges_functions:
			| {
					transactions: () => void;
					cache: () => void;
					time_travel_snapshot: () => void;
			  }
			| undefined
	) {
		super();
		if (onChanges_functions !== undefined) {
			this.onChanges = onChanges_functions;
		}

		this.websocket_api_endpoint = websocket_api_endpoint;
		this.restful_api_endpoint = restful_api_endpoint;
		//console.log("a new uhclient is created ");

		this.websocket = io(websocket_api_endpoint);
		this.websocket.on("syncing_discoverable_transactions", (diff: rdiff.rdiffResult[]) => {
			applyDiff(this.profiles, diff);

			this.transactions = this.active_profile?.transactions || [];
			this.onChange();
		});
	}
	onChange() {
		for (var func of Object.values(this.onChanges)) {
			func();
		}
	}
	get active_profile() {
		return this.profiles.find((profile) => profile.is_active);
	}
	get jwt() {
		return this.active_profile_seed?.jwt;
	}
	get active_profile_seed() {
		return this.profiles_seed.find((profile) => profile.is_active);
	}
	get user_id() {
		return this.active_profile_seed?.user_id;
	}
	get configured_axios(): ReturnType<typeof axios.create> {
		return axios.create({
			baseURL: this.restful_api_endpoint,
			headers: {
				...(this.jwt === undefined ? {} : { jwt: this.jwt }),
			},
		});
	}

	sync_profiles() {
		this.websocket.emit("sync_profiles", this.profiles_seed);
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
				: this.unresolved_cache.filter((i) => i.thing_id === thing_id)[0].thing;
		var response = await this.configured_axios({
			data: {
				diff: rdiff.getDiff(thing, new_thing_creator(JSON.parse(JSON.stringify(thing)))),
				thing_id,
			},
			method: "post",
			url: "/new_transaction",
		});
		return response.data;
	}
}
