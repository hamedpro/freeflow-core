//read README file : UnifiedHandlerSystem.md
import fs from "fs";
import { fileURLToPath } from "url";
import rdiff from "recursive-diff";
var { applyDiff, getDiff } = rdiff;
var common_helpers = await import(fileURLToPath(new URL("../common_helpers.js", import.meta.url)));
var { unique_items_of_array } = common_helpers;
var { frontend_port, api_port, api_endpoint, db_name, mongodb_url, jwt_secret } = JSON.parse(fs.readFileSync(fileURLToPath(new URL("../env.json", import.meta.url)), "utf-8"));
export class UnifiedHandler {
    constructor({ onChange = (transaction) => { } }) {
        //todo i tested and there was 2 loop iterations with same result for new Date().getTime()
        //make sure we can always store everything (including transactions in their exact order )
        //there must be always just a single unified handler db connected to a single mongo db collection
        this.db_change_promises = [];
        this.websocket_clients = [];
        if (fs.existsSync("./store.json") !== true) {
            fs.writeFileSync("./store.json", JSON.stringify([]));
        }
        this.virtual_transactions = JSON.parse(fs.readFileSync("./store.json", "utf-8"));
        this.onChange = onChange;
    }
    check_lock({ user_id, thing_id }) {
        var lock = this.surface_cache.find((i) => {
            return i.type === "meta/lock" && i.current_state.thing_id === thing_id;
        });
        if (lock === undefined)
            return true;
        function is_meta_lock(a) {
            return a.current_state.user_id !== undefined;
        }
        if (is_meta_lock(lock)) {
            if (lock.current_state.is_locked === false) {
                return true;
            }
            else if (lock.current_state.user_id === user_id) {
                return true;
            }
        }
        return false;
    }
    check_privilege(user_id, thing_id, job) {
        /* returns a boolean which is true when this
        user has privilege of doing specified "job" to that thing
        */
        //todo complete this :
        // when there is not any meta / privileges for a "thing"
        //we give write / read permission to everyone
        //but obviously it must not be like that
        var privilege_thing = this.surface_cache.find((i) => i.type === "meta/privileges" && i.current_state.for === thing_id);
        if (privilege_thing === undefined) {
            return true;
        }
        var privilege = privilege_thing.current_state;
        var collaborators_thing = this.surface_cache.find((i) => i.type === "meta/collaborators" && i.current_state.for === thing_id);
        var collaborators = collaborators_thing.current_state.value;
        if (collaborators
            .map((i) => i.user_id)
            .includes(user_id)) {
            //this user is a collaborator
            if (collaborators.find((i) => i.user_id === user_id).is_owner === true) {
                return true;
            }
            else if (job === "write") {
                return privilege.collaborators_except_owner === "write/read";
            }
            else if (job === "read") {
                return (privilege.collaborators_except_owner === "read" ||
                    privilege.collaborators_except_owner === "write/read");
            }
        }
        else {
            //this user is considered in "others" of this thing
            if (job === "write") {
                return privilege.others === "write/read";
            }
            else {
                return privilege.others === "write/read" || privilege.others === "read";
            }
        }
        return false;
    }
    get surface_cache() {
        //returns an array which contains a mapping
        // from thing_ids each to its calculated version
        return unique_items_of_array(this.virtual_transactions.map((i) => i.thing_id)).map((thing_id) => this.calc_thing_state(thing_id));
    }
    new_transaction({ diff, thing_id, type, user_id, }) {
        //applies transaction to virtual_transactions then
        //schedules applying that to db (its promise is pushed
        //to this.db_change_promises and its index is returned)
        if (this.check_privilege(user_id, thing_id, "write") !== true) {
            throw new Error("access denied. required privileges to insert new transaction were not met");
        }
        if (this.check_lock({ user_id, thing_id }) !== true) {
            throw new Error('lock system error. requested transaction insertion was rejected because the "thing" is locked by another one right now.');
        }
        var transaction = {
            time: new Date().getTime(),
            diff,
            thing_id,
            type,
            id: this.virtual_transactions.length + 1,
        };
        this.virtual_transactions.push(transaction);
        var tmp = this.db_change_promises.push(fs.promises.writeFile("./store.json", JSON.stringify(this.virtual_transactions)));
        this.onChange(transaction);
        return tmp;
    }
    sorted_transactions_of_thing(thing_id) {
        return this.virtual_transactions
            .filter((transaction) => transaction.thing_id === thing_id)
            .sort((i1, i2) => i1.time - i2.time);
    }
    calc_thing_state(thing_id, last_transaction_to_consider = undefined) {
        //if last_transaction_to_consider it will only applies changes until that (to init value (which is {}))
        var state = { thing_id, thing: {} };
        for (var transaction of this.sorted_transactions_of_thing(thing_id)) {
            applyDiff(state.thing, transaction.diff);
            if (last_transaction_to_consider !== undefined &&
                last_transaction_to_consider === transaction.id) {
                return state;
            }
        }
        return state;
    }
    calc_discoverable_things(user_id) {
        //this.surface_cache.filter(i => i.)
        return [2, 3, 4];
    }
    calc_discoverable_transactions() { }
    sync_websocket_client(websocket_client) {
        if (websocket_client.last_synced_snapshot === undefined) {
        }
    }
    add_socket(socket, user_id) {
        var new_websocket_client = {
            socket: socket,
            user_id,
            last_synced_snapshot: undefined,
        };
        //sending all discoverable transactions to that user (in diff format)
        this.sync_websocket_client(new_websocket_client);
        //adding event listener of new transaction
        this.websocket_clients.push(new_websocket_client);
    }
}
