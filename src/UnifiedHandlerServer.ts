import cors from "cors";
import formidable, { Files } from "formidable";
import jwt_module from "jsonwebtoken";
import express from "express";
//read README file : UnifiedHandlerSystem.md
import fs, { mkdirSync } from "fs";
import os from "os";
import { createServer as https_create_server } from "https";
import { createServer as http_create_server } from "http";
import nodemailer from "nodemailer";
import rdiff from "recursive-diff";
import AsyncLock from "async-lock";
var { applyDiff, getDiff } = rdiff;
import { readFileSync, rmSync } from "fs";
import { Server, Socket } from "socket.io";
import path from "path";
import {
	cache_item,
	env,
	profile,
	profile_seed,
	core_thing,
	transaction,
	user,
	verification_code,
	websocket_client,
	time_travel_snapshot,
} from "./UnifiedHandler_types.js";
import { exit } from "process";
import {
	calc_cache,
	calc_unresolved_cache,
	calc_user_discoverable_things,
	check_lock,
	extract_user_id,
	find_thing_meta,
	flexible_user_finder,
	new_transaction_privileges_check,
	rdiff_path_to_lock_path_format,
	reserved_value_is_used,
	thing_transactions,
	validate_lock_structure,
} from "./utils.js";
import { custom_find_unique } from "hamedpro-helpers";
import { export_backup } from "./backup.js";
import { sign_jwt } from "./client_side_incompatible_utils.js";
import { perf_profiler } from "./performance_profiler.js";
function custom_express_jwt_middleware(jwt_secret: string) {
	return (request: any, response: any, next: any) => {
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
			} catch (error) {
				response
					.status(400)
					.json(
						"you have provided a jwt (json web token) in request's headers but it was not valid. it was not even required to pass a jwt "
					);
			}
		} else {
			response.locals.user_id = 0;
			next();
		}
	};
}
function gen_verification_code() {
	return Math.floor(100000 + Math.random() * 900000);
}

export class UnifiedHandlerServer {
	profiler: perf_profiler = new perf_profiler();
	websocket_api: ReturnType<typeof https_create_server> | ReturnType<typeof http_create_server>;
	websocket_clients: websocket_client[] = [];
	restful_express_app:
		| ReturnType<typeof https_create_server>
		| ReturnType<typeof http_create_server>;
	jwt_secret: string;
	use_https: boolean;
	websocket_api_port: number;
	restful_api_port: number;
	https_cert_path: undefined | string;
	https_key_path: undefined | string;
	smtp_transport: ReturnType<typeof nodemailer.createTransport>;
	env: env;
	get absolute_paths(): {
		data_dir: string;
		uploads_dir: string;
		store_file: string;
		env_file: string;
	} {
		var tmp: any = { data_dir: path.join(os.homedir(), "./.freeflow_data") };
		tmp.uploads_dir = path.join(tmp.data_dir, "./uploads");
		tmp.store_file = path.join(tmp.data_dir, "./store.json");
		tmp.env_file = path.join(tmp.data_dir, "./env.json");
		return tmp;
	}

	setup_websoket_api() {
		var websocket_server;
		if (this.use_https === true) {
			if (this.https_cert_path === undefined || this.https_key_path === undefined) {
				throw "use_https is ture but at least one of these is undefined : https_cert_path or https_key_path";
			}
			websocket_server = https_create_server({
				key: readFileSync(this.https_key_path, "utf-8"),
				cert: readFileSync(this.https_cert_path, "utf-8"),
			});
		} else {
			websocket_server = http_create_server();
		}

		var io = new Server(websocket_server, {
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
			},
		});
		io.on("connection", (socket) => {
			this.add_socket(socket);
		});
		websocket_server.listen(this.websocket_api_port);
		return websocket_server;
	}
	setup_rest_api() {
		var restful_express_app = express();
		var restful_server;
		if (this.env.use_https === true) {
			if (this.env.https_cert_path === undefined || this.env.https_key_path === undefined) {
				throw "use_https is ture but at least one of these is undefined : https_cert_path or https_key_path";
			}
			restful_server = https_create_server(
				{
					key: readFileSync(this.env.https_key_path, "utf-8"),
					cert: readFileSync(this.env.https_cert_path, "utf-8"),
				},
				restful_express_app
			);
		} else {
			restful_server = http_create_server(restful_express_app);
		}

		restful_express_app.use(cors());
		restful_express_app.use(express.json());
		restful_express_app.use(custom_express_jwt_middleware(this.jwt_secret));
		restful_express_app.post(
			"/register",
			async (
				request: Express.Request & {
					body: {
						email_address: string;
						verf_code: string;
						exp_duration?: number;
					};
				},
				response: any
			) => {
				var his_latest_verf_code = this.cache
					.filter(
						(ci) =>
							ci.thing.type === "verification_code" &&
							ci.thing.value.email === request.body.email_address
						/* ci.thing.value.value.toString() ===
							request.body.verf_code */
					)
					.at(-1);

				if (
					his_latest_verf_code?.thing.type === "verification_code" &&
					his_latest_verf_code.thing.value.value.toString() === request.body.verf_code
				) {
					var new_user_id = this.new_user(request.body.email_address);
					this.new_transaction({
						new_thing_creator: (prev) => ({
							...prev,
							value: {
								...prev.value,
								email_is_verified: true,
							},
						}),
						thing_id: new_user_id,
						user_id: new_user_id,
					});
					response.json({
						jwt: jwt_module.sign(
							{
								user_id: new_user_id,
								...(request.body.exp_duration
									? {
											exp: Math.round(
												new Date().getTime() / 1000 +
													request.body.exp_duration
											),
									  }
									: undefined),
							},
							this.env.jwt_secret
						),
					});
				} else {
					response.status(403).json("verf code not correct.");
					return;
				}
			}
		);
		restful_express_app.post("/login", async (request: any, response: any) => {
			if (
				request.body.identifier === "-1" &&
				request.body.value === this.env.admin_password
			) {
				response.json({ jwt: sign_jwt(this.jwt_secret, undefined, { user_id: -1 }) });
				return;
			}
			var user_id = flexible_user_finder(this.cache, request.body.identifier);
			var user = this.cache.find((item) => item.thing_id === user_id);

			if (user === undefined) {
				response.status(400).json("there is not any user matching that identifier");
				return;
			} else {
				//first, checking if user has sent a correct verification code:
				//then setting x_is_verified
				var latest_verf_code_ci = this.cache
					.filter((i: cache_item) => {
						return (
							i.thing.type === "verification_code" &&
							i.thing.value.email ===
								(user as cache_item<user>).thing.value.email_address
						);
					})
					.at(-1);

				function is_verification_code_ci(ci: cache_item | undefined): ci is {
					thing_id: number;
					thing: verification_code;
				} {
					if (ci) {
						return ci.thing.type === "verification_code";
					} else {
						return false;
					}
				}
				var latest_verf_code =
					is_verification_code_ci(latest_verf_code_ci) &&
					latest_verf_code_ci.thing.value.value;
				if (latest_verf_code.toString() === request.body.value) {
					this.new_transaction({
						new_thing_creator: (thing: any) => ({
							...thing,
							value: {
								...thing.value,
								email_is_verified: true,
							},
						}),

						thing_id: user.thing_id,

						user_id: user.thing_id,
					});
					response.json({
						jwt: sign_jwt(
							this.jwt_secret,
							"exp_days" in request.body ? request.body.exp_days : undefined,
							{ user_id }
						),
					});

					return;
				}

				if (request.body.value === user.thing.value.password) {
					response.json({
						jwt: sign_jwt(
							this.jwt_secret,
							"exp_days" in request.body ? request.body.exp_days : undefined,
							{ user_id }
						),
					});
					return;
				} else {
					response.status(400).json("access denied");
					return;
				}
			}
		});

		restful_express_app.post("/export_backup", async (request: any, response: any) => {
			var user_id = Number(response.locals.user_id);
			var { include_files, profile_seed } = request.body;

			var archive_name = await export_backup({
				all_transactions: this.calc_all_discoverable_transactions([
					this.calc_profile(profile_seed, undefined),
				]),
				initial_values: [],
				included_files: this.calc_user_discoverable_files(user_id),
				user_id: profile_seed.user_id,
			});
			archive_name = path.resolve(archive_name);
			response.download(archive_name, (err: any) => {
				fs.rmSync(archive_name, { force: true });
				if (err) {
					throw err;
				}
			});
		});

		restful_express_app.post("/send_verification_code", async (request: any, response: any) => {
			var email_verf_code = this.new_verf_code(request.body.email_address);
			await this.smtp_transport.sendMail({
				to: request.body.email_address,
				subject: "FreeFlow verification code",
				text: `your verification code is ${email_verf_code}`,
			});

			response.json("done");
			return;
		});
		restful_express_app.post(
			"/change_email",

			async (
				request: Express.Request & {
					body: {
						email_address: string;
						verf_code: verification_code["value"]["value"];
					};
				},
				response: any
			) => {
				if (
					typeof response.locals.user_id !== "number" ||
					response.locals.user_id === 0 ||
					response.locals.user_id === -1
				) {
					response
						.status(400)
						.json("no jwt or jwt is for one of these special user_ids : 0 | -1 ");
				} else {
					if (
						this.verify_email_ownership(
							request.body.email_address,
							request.body.verf_code
						)
					) {
						this.new_transaction({
							thing_id: response.locals.user_id,
							new_thing_creator: (prev) => ({
								...prev,
								value: {
									...prev.value,
									email_address: request.body.email_address,
								},
							}),
							user_id: response.locals.user_id,
						});
						response.json({});
					} else {
						response.status(403).json("your email ownership could not be verified.");
					}
				}
			}
		);
		restful_express_app.get("/files/:file_id", async (request: any, response: any) => {
			var assosiated_meta = this.cache.find(
				(i) =>
					i.thing.type === "meta" &&
					"file_id" in i.thing.value &&
					i.thing.value.file_id === Number(request.params.file_id)
			);

			if (
				assosiated_meta !== undefined &&
				"file_id" in assosiated_meta.thing.value &&
				"file_privileges" in assosiated_meta.thing.value
			) {
				if (
					assosiated_meta.thing.value.file_privileges.read === "*" ||
					assosiated_meta.thing.value.file_privileges.read.includes(
						response.locals.user_id
					)
				) {
					response.download(
						path.resolve(
							path.join(
								this.absolute_paths.uploads_dir,
								`${fs
									.readdirSync(this.absolute_paths.uploads_dir)
									.find((i) => i.startsWith(request.params.file_id))}`
							)
						)
					);
				} else {
					response.status(403).json("you have not access to that file ");
				}
			} else {
				response.status(400).json("couldnt find assosiated meta for this file_id");
			}
		});

		restful_express_app.post("/files", async (request, response) => {
			//saves the file with key = "file" inside sent form inside ./uploads directory
			//returns json : {file_id : string }
			//saved file name + extension is {file_id}-{original file name with extension }
			if (response.locals.user_id === undefined) {
				response.status(403).json("jwt is not provided in request's headers");
				return;
			}
			var { new_file_id, file_mime_type, originalFilename, file_privileges } =
				await new Promise<{
					file_mime_type: string;
					new_file_id: number;
					originalFilename: string;
					file_privileges: string;
				}>((resolve, reject) => {
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
						var new_file_path = path.resolve(
							this.absolute_paths.uploads_dir,
							`${tmp}-${file.originalFilename}`
						);

						fs.renameSync(file.filepath, new_file_path);

						resolve({
							new_file_id: tmp,
							file_mime_type: file.mimetype || "unknown",
							originalFilename: file.originalFilename || "without-original-name",
							file_privileges:
								fields["file_privileges"] &&
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
		});
		restful_express_app.post("/new_transaction", (request, response) => {
			if (!("user_id" in response.locals) || response.locals.user_id === undefined) {
				response
					.status(403)
					.json("submitting a new transaction need a jwt provided in request's headers");
				return;
			} else {
				try {
					response.json(
						this.new_transaction({
							new_thing_creator: (prev_thing: any) => {
								var clone = JSON.parse(JSON.stringify(prev_thing));
								applyDiff(clone, request.body.diff);
								return clone;
							},

							thing_id: request.body.thing_id,
							user_id:
								response.locals
									.user_id /* it always have user_id and ?. is just for ts  */,
						})
					);
				} catch (error) {
					console.log(error);
					response.status(400).json(error);
				}
			}
		});

		(
			restful_server as
				| ReturnType<typeof http_create_server>
				| ReturnType<typeof https_create_server>
		).listen(this.restful_api_port);
		return restful_server;
	}
	constructor() {
		mkdirSync(this.absolute_paths.uploads_dir, { recursive: true });

		if (fs.existsSync(this.absolute_paths.store_file) !== true) {
			fs.writeFileSync(this.absolute_paths.store_file, JSON.stringify([], undefined, 4));
		}

		if (fs.existsSync(this.absolute_paths.env_file) !== true) {
			console.log(
				`env.json does not exist here : ${this.absolute_paths.env_file}. create it with proper properties then try again`
			);
			exit(1);
		}

		var {
			websocket_api_port,
			restful_api_port,
			jwt_secret,
			email_address,
			email_password,
			use_https,
			https_cert_path,
			https_key_path,
			admin_password,
		}: env = JSON.parse(fs.readFileSync(this.absolute_paths.env_file, "utf-8"));
		this.env = JSON.parse(fs.readFileSync(this.absolute_paths.env_file, "utf-8"));
		this.https_key_path = https_key_path;
		this.https_cert_path = https_cert_path;
		this.jwt_secret = jwt_secret;
		this.websocket_api_port = websocket_api_port;
		this.restful_api_port = restful_api_port;
		this.use_https = use_https;
		this.smtp_transport = nodemailer.createTransport({
			host: "smtp.gmail.com",
			auth: {
				user: email_address,
				pass: email_password,
			},
		});
		this.cache = calc_cache(this.transactions, this.time_travel_snapshot);
		this.reload_store();
		this.onChange = () => {
			for (var i of this.websocket_clients) {
				this.sync_websocket_client(i);
			}

			//update cache prop
			this.cache = calc_cache(this.transactions, this.time_travel_snapshot);
		};
		this.websocket_api = this.setup_websoket_api();
		this.restful_express_app = this.setup_rest_api();
	}
	time_travel_snapshot: time_travel_snapshot;
	reload_store() {
		this.transactions = JSON.parse(fs.readFileSync(this.absolute_paths.store_file, "utf-8"));
		this.onChange();
	}
	time_travel(snapshot: time_travel_snapshot) {
		this.time_travel_snapshot = snapshot;
		this.onChange();
	}
	cache: cache_item[];
	get unresolved_cache() {
		return calc_unresolved_cache(this.transactions, this.time_travel_snapshot);
	}
	new_verf_code(email: string): number {
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
	new_user(email_address: string) {
		var new_user_id = this.new_transaction<user, undefined>({
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
				value: {
					...prev_user.value,
					password: `$$ref::${user_private_data_thing_id}:value/password`,
					calendar_type: `$$ref::${user_private_data_thing_id}:value/calendar_type`,
					week_starting_day: `$$ref::${user_private_data_thing_id}:value/week_starting_day`,
					language: `$$ref::${user_private_data_thing_id}:value/language`,
					saved_things: `$$ref::${user_private_data_thing_id}:value/saved_things`,
				},
			}),
			thing_id: new_user_id,
			user_id: new_user_id,
		});
		return new_user_id;
	}

	new_transaction<ThingType extends core_thing, ThingId extends number | undefined>({
		new_thing_creator,
		thing_id,
		user_id,
	}: {
		new_thing_creator: (current_thing: any) => any;
		thing_id: ThingId;
		user_id: number;
		/* 
			if user_id is passed -1
			privilege checks are ignored and new transaction
			is done by system itself.
		*/
	}): number {
		this.profiler.init_new_stat("all_new_tr", "trs count", "time spent");
		var point = this.profiler.new_point("all_new_tr", this.transactions.length);
		point.auto_commit = true;
		point.start();
		var thing: ThingType | {} =
			typeof thing_id === "undefined"
				? {}
				: this.unresolved_cache.filter((i) => i.thing_id === thing_id)[0].thing;

		var new_thing = new_thing_creator(JSON.parse(JSON.stringify(thing)));
		var transaction_diff = getDiff(thing, new_thing);
		if (
			new_thing.type === "meta" &&
			!("file_id" in new_thing.value) &&
			!this.unresolved_cache.some((i) => i.thing_id === new_thing.value.thing_id) &&
			thing_id === undefined
		) {
			throw "rejected : a new meta is going to be created for something that doesnt even exist!";
		}
		if (
			this.new_transaction_privileges_check(
				user_id,
				thing_id,
				this.transactions,
				transaction_diff,
				this.cache
			) !== true
		) {
			throw new Error(
				"access denied. required privileges to insert new transaction were not met" +
					` user ${user_id} wanted to modify thing : ${thing_id || "undefined"}`
			);
		}

		if (new_thing.type === "meta" && "locks" in new_thing.value) {
			if (validate_lock_structure(new_thing.value.locks) === false) {
				throw new Error(
					"applying this transaction will make this thing (which is a thing meta) invalid. its locks will not follow locks standard format."
				);
			}
		}

		if (
			check_lock({
				user_id,
				thing_id,
				cache: this.cache,
				paths: transaction_diff.map((diff) => rdiff_path_to_lock_path_format(diff.path)),
			}) === false
		) {
			throw new Error(
				'lock system error. requested transaction insertion was rejected because the "thing" is locked by another one right now.'
			);
		}

		var transaction: transaction = {
			time: new Date().getTime(),
			diff: transaction_diff,
			thing_id: typeof thing_id === "undefined" ? this.cache.length + 1 : thing_id,
			id: this.transactions.length + 1,
			user_id,
		};
		if (reserved_value_is_used([...this.transactions, transaction]) === true) {
			throw new Error(
				"applying this requested transaction will make unresolved cache contain a reserved value. dont use reserved values in things."
			);
		}
		this.transactions.push(transaction);

		fs.writeFileSync(this.absolute_paths.store_file, JSON.stringify(this.transactions));

		this.onChange();
		point.end();
		return transaction.thing_id;
	}

	calc_profile(profile_seed: profile_seed, transaction_limit: number | undefined): profile {
		var discoverable_for_this_user: transaction[] = this.calc_user_discoverable_transactions(
			profile_seed.user_id
		).filter((tr) => {
			if (transaction_limit === undefined) {
				return true;
			} else {
				return tr.id <= transaction_limit;
			}
		});

		return {
			...profile_seed,
			discoverable_for_this_user: this.apply_max_sync_depth(
				discoverable_for_this_user,
				profile_seed.max_depth
			).map((tr) => tr.id),
		};
	}
	verify_email_ownership(email_address: string, verf_code: verification_code["value"]["value"]) {
		var latest_verf_code_ci = this.cache
			.filter((i: cache_item) => {
				return (
					i.thing.type === "verification_code" && i.thing.value.email === email_address
				);
			})
			.at(-1);

		function is_verification_code_ci(ci: cache_item | undefined): ci is {
			thing_id: number;
			thing: verification_code;
		} {
			if (ci) {
				return ci.thing.type === "verification_code";
			} else {
				return false;
			}
		}
		var latest_verf_code =
			is_verification_code_ci(latest_verf_code_ci) && latest_verf_code_ci.thing.value.value;
		return latest_verf_code === verf_code;
	}
	calc_all_discoverable_transactions(profiles: profile[]): transaction[] {
		var tmp = custom_find_unique(
			profiles.map((prof) => prof.discoverable_for_this_user).flat(),
			undefined
		).map((transaction_id: number) => {
			var tmp = this.transactions.find((tr) => tr.id === transaction_id);
			if (tmp === undefined) {
				throw `internal error: transaction with id ${transaction_id} was supposed to exist but it doesnt. report this issue to dev team.`;
			} else {
				return tmp;
			}
		});

		return tmp;
	}
	sync_websocket_client(websocket_client: websocket_client) {
		var prev: profile[] = (websocket_client.prev_profiles_seed || []).map((seed) =>
			this.calc_profile(seed, websocket_client.last_synced_snapshot)
		);

		var current: profile[] = (websocket_client.profiles_seed || []).map((profile_seed) =>
			this.calc_profile(profile_seed, undefined)
		);

		websocket_client.socket.emit("sync_profiles", getDiff(prev, current));
		websocket_client.last_synced_snapshot = Math.max(...this.transactions.map((i) => i.id));

		websocket_client.socket.emit(
			"sync_all_transactions",
			this.calc_all_discoverable_transactions(current).filter(
				(tr) => websocket_client.cached_transaction_ids.includes(tr.id) === false
			)
		);
	}
	add_socket(socket: websocket_client["socket"]) {
		var new_websocket_client: websocket_client = {
			socket,
			profiles_seed: [],
			last_synced_snapshot: undefined,
			cached_transaction_ids: [],
		};
		this.websocket_clients.push(new_websocket_client);

		socket.on("sync_profiles_seed", (profiles_seed: profile_seed[]) => {
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
				} else {
					throw "freeflow internal error! tried to update profiles of a websocket which doest exist.";
				}

				//sending all discoverable transactions to that user (in diff format)
				this.sync_websocket_client(new_websocket_client);
			} catch (error) {
				console.error(error);
			}
		});
		socket.on("sync_cache", (transaction_ids: transaction["id"][], callback) => {
			new_websocket_client.cached_transaction_ids = transaction_ids;
			callback();
		});
	}
	calc_user_discoverable_files(user_id: number): number[] {
		var results: number[] = [];

		this.cache.forEach((ci) => {
			if (
				ci.thing.type === "meta" &&
				"file_id" in ci.thing.value &&
				"file_privileges" in ci.thing.value &&
				(ci.thing.value.file_privileges.read === "*" ||
					ci.thing.value.file_privileges.read.includes(user_id))
			) {
				results.push(ci.thing_id);
			}
		});

		return results;
	}
	thing_transactions = (thing_id: number) => thing_transactions(this.transactions, thing_id);
	find_first_transaction = (thing_id: number) => this.thing_transactions(thing_id)[0];

	calc_user_discoverable_things = (user_id: number) =>
		calc_user_discoverable_things(this.transactions, this.cache, user_id);

	calc_user_discoverable_transactions = (user_id: number) =>
		this.calc_user_discoverable_things(user_id)
			.map((thing_id) => this.thing_transactions(thing_id))
			.flat();
	find_thing_meta = (thing_id: number) => find_thing_meta(this.cache, thing_id);
	apply_max_sync_depth(
		transactions: transaction[],
		max_sync_depth: number | undefined
	): transaction[] {
		if (max_sync_depth === undefined) {
			return transactions;
		}
		var result: transaction[] = [];
		custom_find_unique(
			transactions.map((tr) => tr.thing_id),
			undefined
		).forEach((unique_thing_id: number) => {
			var clone = transactions.filter((tr) => tr.thing_id === unique_thing_id);
			clone.reverse();
			result.push(...clone.slice(0, max_sync_depth));
		});
		result.sort((tr1, tr2) => tr1.id - tr2.id);
		return result;
	}
	new_transaction_privileges_check = new_transaction_privileges_check;
	extract_user_id = extract_user_id;

	onChange: () => void = () => {};
	find_user_private_data_id(user_id: number): number {
		var user: cache_item | undefined = this.unresolved_cache.find(
			(ci) => ci.thing_id === user_id
		);
		if (user === undefined) {
			throw "was trying to find usr private data : user could not be found";
		} else {
			if (user.thing.type !== "user") {
				throw "internal error. given user id doesnt belong a user";
			} else {
				return Number(user.thing.value.password.split(":")[2]);
			}
		}
	}

	transactions: transaction[] = [];
	reset_but_env() {
		//resets store.json and uploads dir to empty
		//init is done in constructor so there's no need to check any existance
		rmSync(this.absolute_paths.uploads_dir, { recursive: true, force: true });
		mkdirSync(this.absolute_paths.uploads_dir, { recursive: true });
		fs.writeFileSync(this.absolute_paths.store_file, JSON.stringify([]));
		this.reload_store();
	}
}
