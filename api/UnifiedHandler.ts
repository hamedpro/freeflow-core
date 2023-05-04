import EditorJS from "@editorjs/editorjs";
//read README file : UnifiedHandlerSystem.md
import fs from "fs";
import { fileURLToPath } from "url";
import rdiff from "recursive-diff";
var { applyDiff, getDiff } = rdiff;
var common_helpers = await import(fileURLToPath(new URL("../common_helpers.js", import.meta.url)));
var { unique_items_of_array } = common_helpers;
import { Server, Socket } from "socket.io";
interface thing {
	type: string;
	current_state: any;
}
type transaction = {
	id: number;
	thing_id: number;
	time: number;
	diff: rdiff.rdiffResult[];
	type: string;
};
interface meta_lock extends thing {
	type: "meta/lock";
	current_state: {
		is_locked: boolean;
		thing_id: number;
		user_id?: number;
	};
}
interface meta_privileges extends thing {
	type: "meta/privileges";
	current_state: {
		collaborators_except_owner: "write/read" | "read";
		others: "write/read" | "read";
		for: number /* thing_id of assosiated thing */;
	};
}
interface meta_collaborators extends thing {
	type: "meta/collaborators";
	current_state: {
		value: { user_id: string; is_owner: boolean }[];
		for: number /* thing id of assosiated thing  */;
	};
}
interface unit_pack extends thing {
	type: "unit/pack";
	current_state: {
		title: string;
		description: string;
		pack_id?: number | null;
	};
}
interface unit_resource extends thing {
	type: "unit/resource";
	current_state: {
		pack_id?: number | null;
		description: string;
		title: string;
		file_id: number;
	};
}
interface unit_task extends thing {
	type: "unit/task";
	current_state: {
		linked_notes: number[];
		end_time: number;
		pack_id?: number | null;
		start_time: number;
		title: string;
		category_id?: number | null;
		description: string;
	};
}
interface unit_event extends thing {
	type: "unit/event";
	current_state: {
		end_time: number;
		start_time: number;
		title: string;
		category_id?: number | null;
	};
}
interface unit_ask extends thing {
	type: "unit/ask";
	current_state: {
		question: string;
		pack_id?: null | number;
		mode: "poll" | "multiple_choice" | "text_answer";
		options?: string[];
		correct_option_index?: number;
	};
}
interface note extends thing {
	type: "unit/note";
	current_state: {
		title: string;
		pack_id?: null | number;
		data: EditorJS.OutputData;
	};
}
interface user extends thing {
	type: "user";
	current_state: {
		mobile?: string | null;
		email_address?: string | null;
		password?: string | null;
		profile_image_file_id?: number | null;
		calendar_type?: "persian" | "arabic" | "english" | null;
		week_starting_day?:
			| "saturday"
			| "sunday"
			| "monday"
			| "tuesday"
			| "wednesday"
			| "thursday"
			| "friday"
			| null;
		language?: "english" | "persian";
	};
}
interface calendar_category extends thing {
	type: "calendar_category";
	current_state: {
		name: string;
		color: string;
		user_id: number;
	};
}
interface surface_cache_item {
	thing_id: number;
	thing:
		| meta_lock
		| meta_privileges
		| unit_pack
		| unit_resource
		| unit_task
		| unit_event
		| unit_ask
		| note
		| user
		| calendar_category
		| meta_collaborators;
}
type SurfaceCache = surface_cache_item[];
type UnifiedHandlerType = {
	virtual_transactions: transaction[];
	db_change_promises: Promise<void>[];
	onChange: (transaction: transaction) => void;
	websocket_clients: websocket_client[];
};
interface websocket_client {
	socket: Socket;
	user_id: number;
	last_synced_snapshot: number | undefined /*  a transaction_id  */;
}
var { frontend_port, api_port, api_endpoint, db_name, mongodb_url, jwt_secret } = JSON.parse(
	fs.readFileSync(fileURLToPath(new URL("../env.json", import.meta.url)), "utf-8")
);

export class UnifiedHandler implements UnifiedHandlerType {
	//todo i tested and there was 2 loop iterations with same result for new Date().getTime()
	//make sure we can always store everything (including transactions in their exact order )
	//there must be always just a single unified handler db connected to a single mongo db collection
	db_change_promises: Promise<void>[] = [];
	onChange: (transaction: transaction) => void;
	virtual_transactions: transaction[];
	websocket_clients: websocket_client[] = [];
	constructor() {
		if (fs.existsSync("./store.json") !== true) {
			fs.writeFileSync("./store.json", JSON.stringify([]));
		}
		this.virtual_transactions = JSON.parse(fs.readFileSync("./store.json", "utf-8"));

		this.onChange = (transaction) => {
			for (var i of this.websocket_clients) {
				this.sync_websocket_client(i);
			}
		};
	}
	check_lock({ user_id, thing_id }: { thing_id: number; user_id: number }): boolean {
		var lock = this.surface_cache.find((i: surface_cache_item) => {
			return i.thing.type === "meta/lock" && i.thing.current_state.thing_id === thing_id;
		});
		if (lock === undefined) return true;

		function is_meta_lock(a: any): a is meta_lock {
			return (<meta_lock>a).current_state.user_id !== undefined;
		}
		if (is_meta_lock(lock.thing)) {
			if (lock.thing.current_state.is_locked === false) {
				return true;
			} else if (lock.thing.current_state.user_id === user_id) {
				return true;
			}
		}
		return false;
	}

	check_privilege(user_id: number, thing_id: number, job: "write" | "read"): boolean {
		/* returns a boolean which is true when this
		user has privilege of doing specified "job" to that thing 
		*/
		//todo complete this :
		// when there is not any meta / privileges for a "thing"
		//we give write / read permission to everyone
		//but obviously it must not be like that
		var privilege_thing = this.surface_cache.find(
			(i: surface_cache_item) =>
				i.thing.type === "meta/privileges" && i.thing.current_state.for === thing_id
		);
		if (privilege_thing === undefined) {
			return true;
		}

		var privilege: any = privilege_thing.thing.current_state;

		var collaborators_thing: any = this.surface_cache.find(
			(i: surface_cache_item) =>
				i.thing.type === "meta/collaborators" && i.thing.current_state.for === thing_id
		);

		var collaborators = collaborators_thing.current_state.value;

		if (
			collaborators
				.map((i: { user_id: number; is_owner: boolean }) => i.user_id)
				.includes(user_id)
		) {
			//this user is a collaborator
			if (
				collaborators.find(
					(i: { user_id: number; is_owner: boolean }) => i.user_id === user_id
				).is_owner === true
			) {
				return true;
			} else if (job === "write") {
				return privilege.collaborators_except_owner === "write/read";
			} else if (job === "read") {
				return (
					privilege.collaborators_except_owner === "read" ||
					privilege.collaborators_except_owner === "write/read"
				);
			}
		} else {
			//this user is considered in "others" of this thing
			if (job === "write") {
				return privilege.others === "write/read";
			} else {
				return privilege.others === "write/read" || privilege.others === "read";
			}
		}
		return false;
	}
	get surface_cache(): surface_cache_item[] {
		//returns an array which contains a mapping
		// from thing_ids each to its calculated version

		return unique_items_of_array(this.virtual_transactions.map((i) => i.thing_id)).map(
			(thing_id: number) => this.calc_thing_state(thing_id)
		);
	}
	new_transaction({
		diff,
		thing_id,
		type,
		user_id,
	}: {
		diff: rdiff.rdiffResult[];
		thing_id: number;
		type: string;
		user_id: number;
	}): number {
		//applies transaction to virtual_transactions then
		//schedules applying that to db (its promise is pushed
		//to this.db_change_promises and its index is returned)

		if (this.check_privilege(user_id, thing_id, "write") !== true) {
			throw new Error(
				"access denied. required privileges to insert new transaction were not met"
			);
		}
		if (this.check_lock({ user_id, thing_id }) !== true) {
			throw new Error(
				'lock system error. requested transaction insertion was rejected because the "thing" is locked by another one right now.'
			);
		}
		var transaction: transaction = {
			time: new Date().getTime(),
			diff,
			thing_id,
			type,
			id: this.virtual_transactions.length + 1,
		};

		this.virtual_transactions.push(transaction);
		var tmp = this.db_change_promises.push(
			fs.promises.writeFile("./store.json", JSON.stringify(this.virtual_transactions))
		);
		this.onChange(transaction);
		return tmp;
	}

	sorted_transactions_of_thing(thing_id: number) {
		return this.virtual_transactions
			.filter((transaction) => transaction.thing_id === thing_id)
			.sort((i1, i2) => i1.time - i2.time);
	}
	calc_thing_state(thing_id: number, last_transaction_to_consider = undefined) {
		//if last_transaction_to_consider it will only applies changes until that (to init value (which is {}))
		var state = { thing_id, thing: {} };
		for (var transaction of this.sorted_transactions_of_thing(thing_id)) {
			applyDiff(state.thing, transaction.diff);
			if (
				last_transaction_to_consider !== undefined &&
				last_transaction_to_consider === transaction.id
			) {
				return state;
			}
		}

		return state;
	}
	calc_discoverable_things(user_id: number): number[] {
		//returns thing_ids[]
		return this.surface_cache
			.filter((i) => this.check_privilege(user_id, i.thing_id, "read") === true)
			.map((i) => i.thing_id);
	}
	calc_discoverable_transactions(user_id: number): transaction[] {
		return this.calc_discoverable_things(user_id)
			.map((thing_id) =>
				this.virtual_transactions.filter((transaction) => transaction.thing_id === thing_id)
			)
			.flat();
	}
	sync_websocket_client(websocket_client: websocket_client) {
		if (websocket_client.last_synced_snapshot === undefined) {
			websocket_client.socket.emit(
				"syncing_discoverable_transactions",
				getDiff([], this.calc_discoverable_transactions(websocket_client.user_id))
			);
		} else {
			var tmp: number = websocket_client.last_synced_snapshot;
			websocket_client.socket.emit(
				"syncing_discoverable_transactions",
				getDiff(
					this.calc_discoverable_transactions(websocket_client.user_id).filter(
						(transaction) => transaction.id <= tmp
					),
					this.calc_discoverable_transactions(websocket_client.user_id)
				)
			);
		}
	}
	add_socket(socket: Socket, user_id: number) {
		var new_websocket_client: websocket_client = {
			socket: socket,
			user_id,
			last_synced_snapshot: undefined,
		};

		//sending all discoverable transactions to that user (in diff format)
		this.sync_websocket_client(new_websocket_client);

		//adding event listener of to listen to incoming
		//transaction insertion requests from this client
		socket.on("new_transaction", (args) => {
			/* args type : {
			diff: rdiff.rdiffResult[];
			thing_id: number;
			type: string; */

			try {
				this.new_transaction({ ...args, user_id: user_id });
			} catch (error) {
				socket.emit("transaction_insertion_failed", args, error);
			}
		});

		this.websocket_clients.push(new_websocket_client);
	}
}
