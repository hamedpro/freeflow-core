//read README file : UnifiedHandlerSystem.md
import fs from "fs";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";
var rdiff = await import("recursive-diff");
var { applyDiff } = rdiff;

var common_helpers = await import(fileURLToPath(new URL("../common_helpers.js", import.meta.url)));
var { unique_items_of_array } = common_helpers;

var { frontend_port, api_port, api_endpoint, db_name, mongodb_url, jwt_secret } = JSON.parse(
	fs.readFileSync(fileURLToPath(new URL("../env.json", import.meta.url)), "utf-8")
);

var client = new MongoClient(mongodb_url);
var db = client.db(db_name);

export class ServerUnifiedHandler {
	allowed_structures = [(transaction) => transaction.type === "thing"]; // an array of functions which takes (transaction) as their parameters
	privilege_checks = []; // an array of functions which takes (transaction,user_id) as their parameters

	constructor(db) {
		this.db = db;
	}

	//anything but these 2 methods work with virtual_transactions
	//it means nowhere else we have direct connection (read or write) with db
	async read_transactions_from_disk() {
		this.virtual_transactions = await db.collection("transactions").find().toArray();
	}
	async write_transaction_to_disk(transaction) {
		return await this.db.collection("transactions").insertOne(transaction);
	}
	check_lock(user_id, thing_id) {
		var lock = this.virtual_transactions.find(
			(transaction) => transaction.type === "lock" && thing_id === thing_id
		);
		return lock === undefined || lock.user_id === user_id;
	}
	check_privilege(transaction, user_id) {
		/* returns a boolean which is true when this
		user has privilege of applying that transaction

		this.allowed_structures and this.privilege_checks are corresponding value
		we first check whether this comnination of 
		transaction and user_id matches any of allowed structures or not 
		if not that transaction is not permitted otherwise the transaction must pass all
		privilege checks which it matches their allowed structure (whether one or more)
		*/
		var indexes_of_passed_structure_checks = [];
		this.structure_checks.forEach((structure_check, index) => {
			if (structure_check(transaction)) {
				indexes_of_passed_structure_checks.push(index);
			}
		});
		if (indexes_of_passed_structure_checks.length === 0) {
			return false;
		}
		return indexes_of_passed_structure_checks.every((index) =>
			this.privilege_checks[index](transaction, user_id)
		);
	}
	new_transaction(transaction, user_id) {
		/* finishes when changes are applied by lock system 
		and privilege system and then applied to virtual
		transactions but just scheduled to be applied in db
		
		if you want to make sure it is also written in db
		you must await its db_change_promise from this.db_change_promises
		index of new created promise is the return value

	
		otherwise returns false  */
		if (
			this.check_lock(user_id, transaction.thing_id) &&
			this.check_privilege(transaction, user_id)
		) {
			this.virtual_transactions.push(transaction);
			return this.db_change_promises.push(this.write_transaction_to_disk(transaction)) - 1;
		} else {
			return false;
		}
	}

	apply_transaction(current_state_ref, transaction) {
		//it mutate the given object and returns its ref
		applyDiff(current_state_ref, transaction.diff);
		return current_state_ref;
	}
	sorted_transactions_of_thing(thing_id) {
		return this.virtual_transactions
			.filter((transaction) => transaction.id === thing_id)
			.sort((i1, i2) => i1 - i2);
	}
	calc_thing_state(thing_id, last_transaction_to_consider = undefined) {
		//if last_transaction_to_consider it will only applies changes until that (to init value (which is {}))
		var state = {}; // changes must be apply to init value which is always an empty object
		for (var transaction of sorted_transactions_of_thing(thing_id)) {
			this.apply_transaction(state, transaction);
			if (
				last_transaction_to_consider !== undefined &&
				last_transaction_to_consider === transaction._id
			) {
				return state;
			}
		}

		return state;
	}
	async update_cache_surface() {
		//this.cache is always calculated version of current state of that thing
		this.cache = unique_items_of_array(this.virtual_transactions.map((i) => i.thing_id)).map(
			this.calc_thing_state
		);
	}
	client_connections = []; // array of objects in this format : {onChange = (newTransactions) => {blah blah}}
	add_client() {}
}
export class ClientUnifiedHandler {}
