//read README file : UnifiedHandlerSystem.md
import fs from "fs";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";
import rdiff from "recursive-diff";
var { applyDiff, getDiff } = rdiff;
var common_helpers = await import(fileURLToPath(new URL("../common_helpers.js", import.meta.url)));
var { unique_items_of_array } = common_helpers;

var { frontend_port, api_port, api_endpoint, db_name, mongodb_url, jwt_secret } = JSON.parse(
	fs.readFileSync(fileURLToPath(new URL("../env.json", import.meta.url)), "utf-8")
);

var client = new MongoClient(mongodb_url);
var db = client.db(db_name);

function check_lock({ user_id, thing_id, transactions }) {
	var lock = transactions.find(
		(transaction) => transaction.type === "lock" && thing_id === thing_id
	);
	return lock === undefined || lock.user_id === user_id;
}

function check_privilege({
	transaction,
	user_id,
	structure_checks,
	privilege_checks,
	transactions,
}) {
	/* returns a boolean which is true when this
	user has privilege of applying that transaction

	allowed_structures and privilege_checks are corresponding value
	we first check whether this comnination of 
	transaction and user_id matches any of allowed structures or not 
	if not that transaction is not permitted otherwise the transaction must pass all
	privilege checks which it matches their allowed structure (whether one or more)
	*/
	var indexes_of_passed_structure_checks = [];
	structure_checks.forEach((structure_check, index) => {
		if (structure_check({ transaction, user_id, transactions })) {
			indexes_of_passed_structure_checks.push(index);
		}
	});
	if (indexes_of_passed_structure_checks.length === 0) {
		return false;
	}
	return indexes_of_passed_structure_checks.every((index) =>
		privilege_checks[index](transaction, user_id)
	);
}
export class UnifiedHandlerDB {
	//todo i tested and there was 2 loop iterations with same result for new Date().getTime()
	//make sure we can always store everything (including transactions in their exact order )
	//there must be always just a single unified handler db connected to a single mongo db collection

	constructor({ db, onChange }) {
		this.db = db;
		var p = async () => {
			return JSON.parse(JSON.stringify(await db.collection("transactions").find().toArray()));
		};
		this.virtual_transactions = p();

		var p = async () => {
			await this.virtual_transactions;
			return await this.calc_surface_cache();
		};
		this.surface_cache = p();
		this.onChange = onChange || function () {};
	}
	async new_transaction({ diff, thing_id }) {
		//applies transaction to virtual_transactions then
		//schedules applying that to db (its promise is pushed
		//to this.db_change_promises and its index is returned)
		var transaction = { time: new Date().getTime(), diff, thing_id };
		await this.virtual_transactions;
		var { insertedId } = await this.db.collection("transactions").insertOne(transaction);
		var tmp = { ...transaction, _id: insertedId };
		(await this.virtual_transactions).push(tmp);
		var p = async () => {
			return await this.calc_surface_cache();
		};
		this.surface_cache = p;
		this.onChange(tmp);
	}

	async sorted_transactions_of_thing(thing_id) {
		return (await this.virtual_transactions)
			.filter((transaction) => transaction.thing_id === thing_id)
			.sort((i1, i2) => i1.time - i2.time);
	}
	async calc_thing_state(thing_id, last_transaction_to_consider = undefined) {
		//if last_transaction_to_consider it will only applies changes until that (to init value (which is {}))
		var state = undefined;
		for (var transaction of await this.sorted_transactions_of_thing(thing_id)) {
			applyDiff(state, transaction.diff);
			if (
				last_transaction_to_consider !== undefined &&
				last_transaction_to_consider === transaction._id
			) {
				return state;
			}
		}

		return state;
	}
	async calc_surface_cache() {
		//returns an array which contains a mapping
		// from thing_ids each to its calculated version

		return await Promise.all(
			unique_items_of_array((await this.virtual_transactions).map((i) => i.thing_id)).map(
				(thing_id) => this.calc_thing_state(thing_id)
			)
		);
	}
	gen_unique_ids() {
		//this is used to assign each "thing" a unique id
		//todo make sure there wont be any collision
		return `thing-${new Date().getTime()}-${Math.floor(Math.random() * 10000000)}`;
	}
}
