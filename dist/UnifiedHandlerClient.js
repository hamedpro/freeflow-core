var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { io } from "socket.io-client";
import axios from "axios";
import rdiff from "recursive-diff";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore";
import { getRandomSubarray } from "./utils";
import { custom_find_unique } from "hamedpro-helpers";
var { applyDiff } = rdiff;
export class UnifiedHandlerClient extends UnifiedHandlerCore {
    constructor(websocket_api_endpoint, restful_api_endpoint, onChange, strings) {
        super();
        this.profiles_seed = [];
        this.profiles = [];
        // these are union of all profiles
        this.all_transactions = [];
        this.request_new_transaction = ({ new_thing_creator, thing_id, diff, }) => __awaiter(this, void 0, void 0, function* () {
            if ((new_thing_creator === undefined && diff === undefined) ||
                (new_thing_creator !== undefined && diff !== undefined)) {
                throw "only one of these must be not undefined : `new_thing_creator` or `diff`";
            }
            var data = { thing_id };
            if (new_thing_creator === undefined && diff !== undefined) {
                data.diff = diff;
            }
            if (diff === undefined && new_thing_creator !== undefined) {
                var thing = thing_id === undefined
                    ? {}
                    : this.unresolved_cache.filter((i) => i.thing_id === thing_id)[0].thing;
                data.diff = rdiff.getDiff(thing, new_thing_creator(JSON.parse(JSON.stringify(thing))));
            }
            var response = yield this.configured_axios({
                data,
                method: "post",
                url: "/new_transaction",
            });
            return response.data;
        });
        this.strings = strings;
        if (onChange !== undefined) {
            this.onChange = onChange;
        }
        this.websocket_api_endpoint = websocket_api_endpoint;
        this.restful_api_endpoint = restful_api_endpoint;
        //console.log("a new uhclient is created ");
        this.websocket = io(websocket_api_endpoint);
        this.websocket.on("sync_profiles", (diff) => {
            //console.log()
            applyDiff(this.profiles, diff);
            this.update_transactions();
        });
        this.websocket.on("sync_all_transactions", (new_transactions) => {
            this.all_transactions = custom_find_unique(this.all_transactions.concat(new_transactions), (tr1, tr2) => tr1.id === tr2.id);
            this.update_transactions();
        });
    }
    update_transactions() {
        this.transactions = this.all_transactions.filter((tr) => {
            return (this.active_profile &&
                this.active_profile.discoverable_for_this_user.includes(tr.id));
        });
        this.onChange();
    }
    get active_profile() {
        return this.profiles.find((profile) => profile.is_active === true);
    }
    get jwt() {
        var _a;
        return (_a = this.active_profile_seed) === null || _a === void 0 ? void 0 : _a.jwt;
    }
    get active_profile_seed() {
        return this.profiles_seed.find((profile) => profile.is_active);
    }
    get user_id() {
        var _a;
        return ((_a = this.active_profile_seed) === null || _a === void 0 ? void 0 : _a.user_id) || 0;
    }
    get configured_axios() {
        return axios.create({
            baseURL: this.restful_api_endpoint,
            headers: Object.assign({}, (this.jwt === undefined ? {} : { jwt: this.jwt })),
        });
    }
    sync_cache() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.websocket.emit("sync_cache", this.all_transactions.map((tr) => tr.id), resolve);
            });
        });
    }
    sync_profiles_seed() {
        this.websocket.emit("sync_profiles_seed", this.profiles_seed);
    }
    submit_new_resource({ file, description, title, create_more, nav, thing_privileges, pack_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!file) {
                alert(this.strings[204]);
                return;
            }
            var f = new FormData();
            f.append("file", file);
            var { new_file_id, meta_id_of_file } = (yield this.configured_axios({
                data: f,
                url: "/files",
                method: "post",
            })).data;
            var new_resource_id = yield this.request_new_transaction({
                new_thing_creator: () => ({
                    type: "unit/resource",
                    value: {
                        description,
                        title,
                        file_id: new_file_id,
                    },
                }),
                thing_id: undefined,
            });
            var new_meta_id = yield this.request_new_transaction({
                new_thing_creator: () => ({
                    type: "meta",
                    value: {
                        thing_privileges,
                        modify_thing_privileges: this.user_id,
                        locks: [],
                        thing_id: new_resource_id,
                        pack_id,
                    },
                }),
                thing_id: undefined,
            });
            //now lets update file_privileges of that file's meta
            //from now its a link to thing_privileges of meta of this resource
            yield this.request_new_transaction({
                diff: [
                    {
                        op: "update",
                        path: ["value", "file_privileges", "read"],
                        val: `$$ref::${new_meta_id}:value/thing_privileges/read`,
                    },
                ],
                thing_id: meta_id_of_file,
            });
            alert(`all done! new file with id = ${new_file_id} is now linked to this new resource : ${new_resource_id}`);
            if (!create_more) {
                nav(`/${new_resource_id}`);
            }
        });
    }
    bootstrap_a_writing({ text, nav, }) {
        return __awaiter(this, void 0, void 0, function* () {
            var data = {
                blocks: [
                    {
                        type: "paragraph",
                        data: {
                            text,
                        },
                    },
                ],
            };
            //create the note itself
            var new_note_id = yield this.request_new_transaction({
                new_thing_creator: () => ({
                    type: "unit/note",
                    value: {
                        data,
                        title: "bootstraped note",
                    },
                }),
                thing_id: undefined,
            });
            //create its meta
            yield this.request_new_transaction({
                new_thing_creator: () => ({
                    type: "meta",
                    value: {
                        thing_privileges: {
                            read: [this.user_id],
                            write: [this.user_id],
                        },
                        modify_thing_privileges: this.user_id,
                        thing_id: new_note_id,
                        locks: [],
                    },
                }),
                thing_id: undefined,
            });
            //continue with this new created note
            return new_note_id;
        });
    }
    bootstrap_a_pack({ title, callback, }) {
        return __awaiter(this, void 0, void 0, function* () {
            var id_of_new_pack = yield this.request_new_transaction({
                new_thing_creator: () => ({
                    type: "unit/pack",
                    value: {
                        title,
                        description: "this pack was bootstraped",
                    },
                }),
                thing_id: undefined,
            });
            yield this.request_new_transaction({
                new_thing_creator: () => ({
                    type: "meta",
                    value: {
                        thing_privileges: {
                            write: [this.user_id],
                            read: [this.user_id],
                        },
                        modify_thing_privileges: this.user_id,
                        locks: [],
                        thing_id: id_of_new_pack,
                    },
                }),
                thing_id: undefined,
            });
            callback(id_of_new_pack);
        });
    }
    bootstrap_an_ask(value, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var id_of_new_ask = yield this.request_new_transaction({
                new_thing_creator: () => ({
                    type: "unit/ask",
                    value,
                }),
                thing_id: undefined,
            });
            yield this.request_new_transaction({
                new_thing_creator: () => ({
                    type: "meta",
                    value: {
                        thing_privileges: {
                            write: [this.user_id],
                            read: [this.user_id],
                        },
                        modify_thing_privileges: this.user_id,
                        locks: [],
                        thing_id: id_of_new_ask,
                    },
                }),
                thing_id: undefined,
            });
            callback(id_of_new_ask);
        });
    }
    recommend_to_me() {
        /* returns discoverable thing_ids sorted
        for this user.
        sorted by how its likely to be liked by the user */
        //its planned to be done
        //track github repo
        return getRandomSubarray(this.cache.map((ci) => ci.thing_id), this.cache.length);
    }
    calc_reputations() {
        /* returns discoverable thing_ids sorted
        from more important to less  */
        //its planned to be done
        //track github issues
        return getRandomSubarray(this.cache.map((ci) => ci.thing_id), this.cache.length);
    }
    get user() {
        var tmp = this.cache.find((ci) => ci.thing_id === this.user_id);
        function is_user(cache_item) {
            if (cache_item) {
                return cache_item.thing.type === "user";
            }
            else {
                return false;
            }
        }
        if (is_user(tmp)) {
            return tmp;
        }
        else {
            return undefined;
        }
    }
    get things_i_watch() {
        var _a;
        return ((_a = this.user) === null || _a === void 0 ? void 0 : _a.thing.value.watching) || [];
    }
}
