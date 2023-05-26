import { io } from "socket.io-client";
import axios from "axios";
import rdiff from "recursive-diff";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore";
var { applyDiff } = rdiff;

export class UnifiedHandlerClient extends UnifiedHandlerCore {
	websocket: ReturnType<typeof io>;
	websocket_api_endpoint: string;
	restful_api_endpoint: string;
	constructor(websocket_api_endpoint: string, restful_api_endpoint: string) {
		super();
		this.websocket_api_endpoint = websocket_api_endpoint;
		this.restful_api_endpoint = restful_api_endpoint;
		//console.log("a new uhclient is created ");

		this.websocket = io(websocket_api_endpoint);
		this.websocket.on("syncing_discoverable_transactions", (args: rdiff.rdiffResult[]) => {
			applyDiff(this.transactions, args);
			this.onChanges.transactions();
		});
	}
	get jwt() {
		return window.localStorage.getItem("jwt") ?? undefined;
	}
	get configured_axios(): ReturnType<typeof axios.create> {
		return axios.create({
			baseURL: this.restful_api_endpoint,
			headers: {
				...(this.jwt === undefined ? {} : { jwt: this.jwt }),
			},
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
				: this.cache.filter((i) => i.thing_id === thing_id)[0].thing;
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
