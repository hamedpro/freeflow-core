import { io } from "socket.io-client";
import { transaction } from "./UnifiedHandler_types";
import axios from "axios";
import rdiff from "recursive-diff";
var { applyDiff } = rdiff;

export class UnifiedHandlerClient {
	websocket: ReturnType<typeof io>;
	discoverable_transactions: transaction[] = [];
	configured_axios: ReturnType<typeof axios.create>;
	constructor(websocket_api_endpoint: string, restful_api_endpoint: string) {
		this.configured_axios = axios.create({
			baseURL: restful_api_endpoint,
		});
		this.websocket = io(websocket_api_endpoint);
		this.websocket.on("syncing_discoverable_transactions", (args: rdiff.rdiffResult[]) => {
			applyDiff(this.discoverable_transactions, args);
		});
	}
	auth(jwt: string) {
		this.websocket.emit("jwt", jwt);
	}
}
