var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cors from "cors";
import formidable from "formidable";
import jwt_module from "jsonwebtoken";
import express from "express";
//read README file : UnifiedHandlerSystem.md
import fs, { mkdirSync } from "fs";
import os from "os";
import nodemailer from "nodemailer";
import rdiff from "recursive-diff";
import AsyncLock from "async-lock";
var { applyDiff, getDiff } = rdiff;
import { Server } from "socket.io";
import path from "path";
import { exit } from "process";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore.js";
import { flexible_user_finder, rdiff_path_to_lock_path_format, reserved_value_is_used, validate_lock_structure, } from "./utils.js";
import { custom_find_unique } from "hamedpro-helpers";
import { export_backup } from "./backup.js";
function custom_express_jwt_middleware(jwt_secret) {
    return (request, response, next) => {
        if (("headers" in request && "jwt" in request.headers) || "jwt" in request.query) {
            if (request.headers.jwt && request.query.jwt) {
                response
                    .status(400)
                    .json("jwt is sent through request.query alongside with req headers");
                return;
            }
            var jwt = request.headers.jwt || request.query.jwt;
            try {
                var payload = jwt_module.verify(jwt, jwt_secret);
                if (typeof payload !== "string") {
                    response.locals.user_id = payload.user_id;
                    next();
                }
            }
            catch (error) {
                response
                    .status(400)
                    .json("you have provided a jwt (json web token) in request's headers but it was not valid. it was not even required to pass a jwt ");
            }
        }
        else {
            response.locals.user_id = 0;
            next();
        }
    };
}
function gen_verification_code() {
    return Math.floor(100000 + Math.random() * 900000);
}
export class UnifiedHandlerServer extends UnifiedHandlerCore {
    get absolute_paths() {
        var tmp = { data_dir: path.join(os.homedir(), "./.freeflow_data") };
        tmp.uploads_dir = path.join(tmp.data_dir, "./uploads");
        tmp.store_file = path.join(tmp.data_dir, "./store.json");
        tmp.env_file = path.join(tmp.data_dir, "./env.json");
        return tmp;
    }
    constructor() {
        super();
        this.websocket_clients = [];
        this.lock = new AsyncLock();
        this.gen_lock_safe_request_handler = (func) => (request, response) => __awaiter(this, void 0, void 0, function* () {
            return this.lock.acquire("restful_request", (done) => __awaiter(this, void 0, void 0, function* () {
                yield func(request, response);
                done();
            }));
        });
        mkdirSync(this.absolute_paths.uploads_dir, { recursive: true });
        if (fs.existsSync(this.absolute_paths.store_file) !== true) {
            fs.writeFileSync(this.absolute_paths.store_file, JSON.stringify([], undefined, 4));
        }
        if (fs.existsSync(this.absolute_paths.env_file) !== true) {
            console.log(`env.json does not exist here : ${this.absolute_paths.env_file}. create it with proper properties then try again`);
            exit();
        }
        var { websocket_api_port, restful_api_port, jwt_secret, email_address, email_password, } = JSON.parse(fs.readFileSync(this.absolute_paths.env_file, "utf-8"));
        this.jwt_secret = jwt_secret;
        this.websocket_api_port = websocket_api_port;
        this.restful_api_port = restful_api_port;
        this.smtp_transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                user: email_address,
                pass: email_password,
            },
        });
        this.transactions = JSON.parse(fs.readFileSync(this.absolute_paths.store_file, "utf-8"));
        this.onChange = () => {
            for (var i of this.websocket_clients) {
                this.sync_websocket_client(i);
            }
        };
        this.restful_express_app = express();
        this.restful_express_app.use(cors());
        this.restful_express_app.use(express.json());
        this.restful_express_app.use(custom_express_jwt_middleware(this.jwt_secret));
        this.restful_express_app.post("/register", this.gen_lock_safe_request_handler((request, response) => __awaiter(this, void 0, void 0, function* () {
            var his_latest_verf_code = this.cache
                .filter((ci) => ci.thing.type === "verification_code" &&
                ci.thing.value.email === request.body.email_address
            /* ci.thing.value.value.toString() ===
                request.body.verf_code */
            )
                .at(-1);
            if ((his_latest_verf_code === null || his_latest_verf_code === void 0 ? void 0 : his_latest_verf_code.thing.type) === "verification_code" &&
                his_latest_verf_code.thing.value.value.toString() === request.body.verf_code) {
                var new_user_id = this.new_user(request.body.email_address);
                this.new_transaction({
                    new_thing_creator: (prev) => (Object.assign(Object.assign({}, prev), { value: Object.assign(Object.assign({}, prev.value), { email_is_verified: true }) })),
                    thing_id: new_user_id,
                    user_id: new_user_id,
                });
                response.json({
                    jwt: jwt_module.sign(Object.assign({ user_id: new_user_id }, (request.body.exp_duration
                        ? {
                            exp: Math.round(new Date().getTime() / 1000 +
                                request.body.exp_duration),
                        }
                        : undefined)), jwt_secret),
                });
            }
            else {
                response.status(403).json("verf code not correct.");
                return;
            }
        })));
        this.restful_express_app.post("/login", this.gen_lock_safe_request_handler((request, response) => __awaiter(this, void 0, void 0, function* () {
            var user_id = flexible_user_finder(this.cache, request.body.identifier);
            var user = this.cache.find((item) => item.thing_id === user_id);
            function is_user(cache_item) {
                if (cache_item && cache_item.thing.type === "user") {
                    return true;
                }
                else {
                    return false;
                }
            }
            if (!is_user(user)) {
                response.status(400).json("there is not any user matching that identifier");
                return;
            }
            else {
                //first, checking if user has sent a correct verification code:
                //then setting x_is_verified
                var latest_verf_code_ci = this.cache
                    .filter((i) => {
                    return (i.thing.type === "verification_code" &&
                        is_user(user) &&
                        i.thing.value.email === user.thing.value.email_address);
                })
                    .at(-1);
                function is_verification_code_ci(ci) {
                    if (ci) {
                        return ci.thing.type === "verification_code";
                    }
                    else {
                        return false;
                    }
                }
                var latest_verf_code = is_verification_code_ci(latest_verf_code_ci) &&
                    latest_verf_code_ci.thing.value.value;
                if (latest_verf_code.toString() === request.body.value) {
                    this.new_transaction({
                        new_thing_creator: (thing) => (Object.assign(Object.assign({}, thing), { value: Object.assign(Object.assign({}, thing.value), { email_is_verified: true }) })),
                        thing_id: user.thing_id,
                        user_id: user.thing_id,
                    });
                    response.json({
                        jwt: jwt_module.sign(Object.assign({ user_id }, ("exp_duration" in request.body
                            ? {
                                exp: Math.round(new Date().getTime() / 1000 +
                                    request.body.exp_duration),
                            }
                            : undefined)), this.jwt_secret),
                    });
                    return;
                }
                if (request.body.value === user.thing.value.password) {
                    response.json({
                        jwt: jwt_module.sign(Object.assign({ user_id }, ("exp_duration" in request.body
                            ? {
                                exp: Math.round(new Date().getTime() / 1000 +
                                    request.body.exp_duration),
                            }
                            : undefined)), this.jwt_secret),
                    });
                    return;
                }
                else {
                    response.status(400).json("access denied");
                    return;
                }
            }
        })));
        this.restful_express_app.post("/export_backup", this.gen_lock_safe_request_handler((request, response) => __awaiter(this, void 0, void 0, function* () {
            var user_id = Number(response.locals.user_id);
            var { include_files, profile_seed } = request.body;
            var archive_name = yield export_backup({
                all_transactions: this.calc_all_discoverable_transactions([
                    this.calc_profile(profile_seed, undefined),
                ]),
                initial_values: [],
                included_files: this.calc_user_discoverable_files(user_id),
                user_id: profile_seed.user_id,
            });
            archive_name = path.resolve(archive_name);
            response.download(archive_name, (err) => {
                fs.rmSync(archive_name, { force: true });
                if (err) {
                    throw err;
                }
            });
        })));
        this.restful_express_app.post("/send_verification_code", this.gen_lock_safe_request_handler((request, response) => __awaiter(this, void 0, void 0, function* () {
            var email_verf_code = this.new_verf_code(request.body.email_address);
            yield this.smtp_transport.sendMail({
                to: request.body.email_address,
                subject: "FreeFlow verification code",
                text: `your verification code is ${email_verf_code}`,
            });
            response.json("done");
            return;
        })));
        this.restful_express_app.post("/change_email", this.gen_lock_safe_request_handler((request, response) => __awaiter(this, void 0, void 0, function* () {
            if (typeof response.locals.user_id !== "number" ||
                response.locals.user_id === 0 ||
                response.locals.user_id === -1) {
                response
                    .status(400)
                    .json("no jwt or jwt is for one of these special user_ids : 0 | -1 ");
            }
            else {
                if (this.verify_email_ownership(request.body.email_address, request.body.verf_code)) {
                    this.new_transaction({
                        thing_id: response.locals.user_id,
                        new_thing_creator: (prev) => (Object.assign(Object.assign({}, prev), { value: Object.assign(Object.assign({}, prev.value), { email_address: request.body.email_address }) })),
                        user_id: response.locals.user_id,
                    });
                    response.json({});
                }
                else {
                    response
                        .status(403)
                        .json("your email ownership could not be verified.");
                }
            }
        })));
        this.restful_express_app.get("/files/:file_id", this.gen_lock_safe_request_handler((request, response) => __awaiter(this, void 0, void 0, function* () {
            var assosiated_meta = this.cache.find((i) => i.thing.type === "meta" &&
                "file_id" in i.thing.value &&
                i.thing.value.file_id === Number(request.params.file_id));
            if (assosiated_meta !== undefined &&
                "file_id" in assosiated_meta.thing.value &&
                "file_privileges" in assosiated_meta.thing.value) {
                if (assosiated_meta.thing.value.file_privileges.read === "*" ||
                    assosiated_meta.thing.value.file_privileges.read.includes(response.locals.user_id)) {
                    response.download(path.resolve(path.join(this.absolute_paths.uploads_dir, `${fs
                        .readdirSync(this.absolute_paths.uploads_dir)
                        .find((i) => i.startsWith(request.params.file_id))}`)));
                }
                else {
                    response.status(403).json("you have not access to that file ");
                }
            }
            else {
                response.status(400).json("couldnt find assosiated meta for this file_id");
            }
        })));
        this.restful_express_app.post("/files", this.gen_lock_safe_request_handler((request, response) => __awaiter(this, void 0, void 0, function* () {
            //saves the file with key = "file" inside sent form inside ./uploads directory
            //returns json : {file_id : string }
            //saved file name + extension is {file_id}-{original file name with extension }
            if (response.locals.user_id === undefined) {
                response.status(403).json("jwt is not provided in request's headers");
                return;
            }
            var { new_file_id, file_mime_type, originalFilename, file_privileges } = yield new Promise((resolve, reject) => {
                var f = formidable({
                    uploadDir: path.resolve(this.absolute_paths.uploads_dir),
                });
                f.parse(request, (err, fields, files) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var file = files["file"][0];
                    var tmp = this.cache.length + 1;
                    var new_file_path = path.resolve(this.absolute_paths.uploads_dir, `${tmp}-${file.originalFilename}`);
                    fs.renameSync(file.filepath, new_file_path);
                    resolve({
                        new_file_id: tmp,
                        file_mime_type: file.mimetype || "unknown",
                        originalFilename: file.originalFilename || "without-original-name",
                        file_privileges: fields["file_privileges"] &&
                            JSON.parse(fields["file_privileges"][0]),
                    });
                    return;
                });
            });
            var meta_id_of_file = this.new_transaction({
                new_thing_creator: (prev) => ({
                    type: "meta",
                    value: {
                        file_id: new_file_id,
                        file_privileges: file_privileges || {
                            read: [response.locals.user_id],
                        },
                        modify_privileges: response.locals.user_id,
                        file_mime_type,
                        originalFilename,
                    },
                }),
                user_id: -1,
                thing_id: undefined,
            });
            response.json({ new_file_id, meta_id_of_file });
        })));
        this.restful_express_app.post("/new_transaction", (request, response) => {
            if (!("user_id" in response.locals) || response.locals.user_id === undefined) {
                response
                    .status(403)
                    .json("submitting a new transaction need a jwt provided in request's headers");
                return;
            }
            else {
                try {
                    response.json(this.new_transaction({
                        new_thing_creator: (prev_thing) => {
                            var clone = JSON.parse(JSON.stringify(prev_thing));
                            applyDiff(clone, request.body.diff);
                            return clone;
                        },
                        thing_id: request.body.thing_id,
                        user_id: response.locals
                            .user_id /* it always have user_id and ?. is just for ts  */,
                    }));
                }
                catch (error) {
                    console.log(error);
                    response.status(400).json(error);
                }
            }
        });
        this.restful_express_app.listen(this.restful_api_port);
        var io = new Server(this.websocket_api_port, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });
        io.on("connection", (socket) => {
            this.add_socket(socket);
        });
    }
    new_verf_code(email) {
        var result = gen_verification_code();
        this.new_transaction({
            user_id: -1,
            new_thing_creator: () => ({
                type: "verification_code",
                value: {
                    email,
                    value: result,
                },
            }),
            thing_id: undefined,
        });
        return result;
    }
    new_user(email_address) {
        var new_user_id = this.new_transaction({
            new_thing_creator: () => ({
                type: "user",
                value: {
                    email_address,
                },
            }),
            thing_id: undefined,
            user_id: -1,
        });
        this.new_transaction({
            new_thing_creator: () => ({
                type: "meta",
                value: {
                    thing_privileges: {
                        read: "*",
                        write: [new_user_id],
                    },
                    modify_thing_privileges: new_user_id,
                    locks: [],
                    thing_id: new_user_id,
                },
            }),
            user_id: -1,
            thing_id: undefined,
        });
        var user_private_data_thing_id = this.new_transaction({
            new_thing_creator: () => ({
                type: "user_private_data",
                value: {},
            }),
            thing_id: undefined,
            user_id: new_user_id,
        });
        var user_private_data_meta = this.new_transaction({
            new_thing_creator: () => ({
                type: "meta",
                value: {
                    locks: [],
                    modify_thing_privileges: new_user_id,
                    thing_privileges: {
                        read: [new_user_id],
                        write: [new_user_id],
                    },
                    thing_id: user_private_data_thing_id,
                },
            }),
            thing_id: undefined,
            user_id: new_user_id,
        });
        this.new_transaction({
            new_thing_creator: (prev_user) => ({
                type: "user",
                value: Object.assign(Object.assign({}, prev_user.value), { password: `$$ref::${user_private_data_thing_id}:value/password`, calendar_type: `$$ref::${user_private_data_thing_id}:value/calendar_type`, week_starting_day: `$$ref::${user_private_data_thing_id}:value/week_starting_day`, language: `$$ref::${user_private_data_thing_id}:value/language`, saved_things: `$$ref::${user_private_data_thing_id}:value/saved_things` }),
            }),
            thing_id: new_user_id,
            user_id: new_user_id,
        });
        return new_user_id;
    }
    new_transaction({ new_thing_creator, thing_id, user_id, }) {
        console.time("all_new_tr");
        var thing = typeof thing_id === "undefined"
            ? {}
            : this.unresolved_cache.filter((i) => i.thing_id === thing_id)[0].thing;
        var new_thing = new_thing_creator(JSON.parse(JSON.stringify(thing)));
        var transaction_diff = getDiff(thing, new_thing);
        if (new_thing.type === "meta" &&
            !("file_id" in new_thing.value) &&
            !this.unresolved_cache.some((i) => i.thing_id === new_thing.value.thing_id) &&
            thing_id === undefined) {
            throw "rejected : a new meta is going to be created for something that doesnt even exist!";
        }
        if (this.new_transaction_privileges_check(user_id, thing_id, this.transactions, transaction_diff) !== true) {
            throw new Error("access denied. required privileges to insert new transaction were not met" +
                ` user ${user_id} wanted to modify thing : ${thing_id || "undefined"}`);
        }
        if (new_thing.type === "meta" && "locks" in new_thing.value) {
            if (validate_lock_structure(new_thing.value.locks) === false) {
                throw new Error("applying this transaction will make this thing (which is a thing meta) invalid. its locks will not follow locks standard format.");
            }
        }
        if (this.check_lock({
            user_id,
            thing_id,
            cache: this.cache,
            paths: transaction_diff.map((diff) => rdiff_path_to_lock_path_format(diff.path)),
        }) === false) {
            throw new Error('lock system error. requested transaction insertion was rejected because the "thing" is locked by another one right now.');
        }
        var transaction = {
            time: new Date().getTime(),
            diff: transaction_diff,
            thing_id: typeof thing_id === "undefined" ? this.cache.length + 1 : thing_id,
            id: this.transactions.length + 1,
            user_id,
        };
        if (reserved_value_is_used([...this.transactions, transaction]) === true) {
            throw new Error("applying this requested transaction will make unresolved cache contain a reserved value. dont use reserved values in things.");
        }
        this.transactions.push(transaction);
        fs.writeFileSync(this.absolute_paths.store_file, JSON.stringify(this.transactions));
        console.time("onchange");
        this.onChange();
        console.timeEnd("onchange");
        console.timeEnd("all_new_tr");
        return transaction.thing_id;
    }
    calc_profile(profile_seed, transaction_limit) {
        var discoverable_for_this_user = this.calc_user_discoverable_transactions(profile_seed.user_id).filter((tr) => {
            if (transaction_limit === undefined) {
                return true;
            }
            else {
                return tr.id <= transaction_limit;
            }
        });
        return Object.assign(Object.assign({}, profile_seed), { discoverable_for_this_user: this.apply_max_sync_depth(discoverable_for_this_user, profile_seed.max_depth).map((tr) => tr.id) });
    }
    verify_email_ownership(email_address, verf_code) {
        var latest_verf_code_ci = this.cache
            .filter((i) => {
            return (i.thing.type === "verification_code" && i.thing.value.email === email_address);
        })
            .at(-1);
        function is_verification_code_ci(ci) {
            if (ci) {
                return ci.thing.type === "verification_code";
            }
            else {
                return false;
            }
        }
        var latest_verf_code = is_verification_code_ci(latest_verf_code_ci) && latest_verf_code_ci.thing.value.value;
        return latest_verf_code === verf_code;
    }
    calc_all_discoverable_transactions(profiles) {
        var tmp = custom_find_unique(profiles.map((prof) => prof.discoverable_for_this_user).flat(), undefined).map((transaction_id) => {
            var tmp = this.transactions.find((tr) => tr.id === transaction_id);
            if (tmp === undefined) {
                throw `internal error: transaction with id ${transaction_id} was supposed to exist but it doesnt. report this issue to dev team.`;
            }
            else {
                return tmp;
            }
        });
        return tmp;
    }
    sync_websocket_client(websocket_client) {
        var prev = (websocket_client.prev_profiles_seed || []).map((seed) => this.calc_profile(seed, websocket_client.last_synced_snapshot));
        var current = (websocket_client.profiles_seed || []).map((profile_seed) => this.calc_profile(profile_seed, undefined));
        websocket_client.socket.emit("sync_profiles", getDiff(prev, current));
        websocket_client.last_synced_snapshot = Math.max(...this.transactions.map((i) => i.id));
        websocket_client.socket.emit("sync_all_transactions", this.calc_all_discoverable_transactions(current).filter((tr) => websocket_client.cached_transaction_ids.includes(tr.id) === false));
    }
    add_socket(socket) {
        var new_websocket_client = {
            socket,
            profiles_seed: [],
            last_synced_snapshot: undefined,
            cached_transaction_ids: [],
        };
        this.websocket_clients.push(new_websocket_client);
        socket.on("sync_profiles_seed", (profiles_seed) => {
            try {
                for (var profile_seed of profiles_seed) {
                    if (typeof profile_seed.jwt === "string") {
                        var decoded_jwt = jwt_module.verify(profile_seed.jwt, this.jwt_secret);
                        if (typeof decoded_jwt !== "string" /* this bool is always true */) {
                            var { user_id } = decoded_jwt;
                            if (user_id !== profile_seed.user_id) {
                                throw "jwt was verified but user id of profile does not match the user id inside the jwt";
                            }
                        }
                    }
                }
                var t = this.websocket_clients.find((cl) => cl.socket === socket);
                if (t !== undefined) {
                    t.prev_profiles_seed = t.profiles_seed;
                    t.profiles_seed = profiles_seed;
                }
                else {
                    throw "freeflow internal error! tried to update profiles of a websocket which doest exist.";
                }
                //sending all discoverable transactions to that user (in diff format)
                this.sync_websocket_client(new_websocket_client);
            }
            catch (error) {
                console.error(error);
            }
        });
        socket.on("sync_cache", (transaction_ids, callback) => {
            new_websocket_client.cached_transaction_ids = transaction_ids;
            callback();
        });
    }
}
