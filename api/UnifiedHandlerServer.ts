import cors from "cors";
import formidable from "formidable";
import jwt_module from "jsonwebtoken";
import express from "express";
//read README file : UnifiedHandlerSystem.md
import fs, { mkdirSync } from "fs";
import os from "os";
import rdiff from "recursive-diff";
import AsyncLock from "async-lock";
var { applyDiff, getDiff } = rdiff;

import { Server, Socket } from "socket.io";
import path from "path";
import {
	cache_item,
	profile,
	profile_seed,
	profiles,
	thing,
	transaction,
	user,
	websocket_client,
} from "./UnifiedHandler_types.js";
import { exit } from "process";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore.js";
import {
	rdiff_path_to_lock_path_format,
	validate_lock_structure,
	validate_refs_values,
} from "./utils.js";
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
					//todo disconnect websocket when jwt expires
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

export class UnifiedHandlerServer extends UnifiedHandlerCore {
	websocket_clients: websocket_client[] = [];
	restful_express_app: express.Express;
	jwt_secret: string;
	websocket_api_port: number;
	restful_api_port: number;
	frontend_endpoint: string;
	lock = new AsyncLock();
	gen_lock_safe_request_handler =
		(func: (response: any, reject: any) => any) => async (request: any, response: any) =>
			this.lock.acquire("restful_request", async (done) => {
				await func(request, response);
				done();
			});

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
	constructor() {
		super();

		mkdirSync(this.absolute_paths.uploads_dir, { recursive: true });

		if (fs.existsSync(this.absolute_paths.store_file) !== true) {
			fs.writeFileSync(this.absolute_paths.store_file, JSON.stringify([], undefined, 4));
		}

		if (fs.existsSync(this.absolute_paths.env_file) !== true) {
			console.log(
				`env.json does not exist here : ${this.absolute_paths.env_file}. create it with proper properties then try again`
			);
			exit();
		}

		var {
			websocket_api_port,
			restful_api_port,
			jwt_secret,
			frontend_endpoint,
		}: {
			websocket_api_port: number;
			restful_api_port: number;
			jwt_secret: string;
			frontend_endpoint: string;
		} = JSON.parse(fs.readFileSync(this.absolute_paths.env_file, "utf-8"));

		this.frontend_endpoint = frontend_endpoint;
		this.jwt_secret = jwt_secret;
		this.websocket_api_port = websocket_api_port;
		this.restful_api_port = restful_api_port;

		this.transactions = JSON.parse(fs.readFileSync(this.absolute_paths.store_file, "utf-8"));

		this.onChanges.cache = this.onChanges.transactions = () => {
			for (var i of this.websocket_clients) {
				this.sync_websocket_client(i);
			}
		};
		this.restful_express_app = express();
		this.restful_express_app.use(cors());
		this.restful_express_app.use(express.json());
		this.restful_express_app.use(custom_express_jwt_middleware(this.jwt_secret));
		this.restful_express_app.post(
			"/register",
			this.gen_lock_safe_request_handler(
				async (
					request: Express.Request & { body: { username: string; password: string } },
					response: any
				) => {
					if (
						this.cache
							.filter((item: cache_item) => item.thing.type === "user")
							.map((item: any) => item.thing.value.username)
							.includes(request.body.username)
					) {
						response.status(400).json("username is taken");
					} else {
						var new_user_id = this.new_user(
							request.body.username,
							request.body.password
						);

						response.json({
							jwt: jwt_module.sign({ user_id: new_user_id }, jwt_secret),
						});
					}
				}
			)
		);
		this.restful_express_app.post(
			"/login",
			this.gen_lock_safe_request_handler(async (request: any, response: any) => {
				var user_id = this.flexible_user_finder(request.body.identifier);
				if (user_id === undefined) {
					response.status(400).json("sent combination was not valid");
					return;
				}
				if (request.body.login_mode === "verf_code_mode") {
					var filtered_surface_cache: any = this.cache.filter((i: any) => {
						return (
							i.thing.type === "verification_code" &&
							i.thing.value.user_id === user_id
						);
					});

					if (filtered_surface_cache.length === 0) {
						response.status(400).json("sent combination was not valid");
						return;
					}
					if (filtered_surface_cache[0].thing.value.value === request.body.value) {
						this.new_transaction({
							new_thing_creator: (thing: any) => ({
								...thing,
								value: {
									...thing.value,
									[thing.value.kind + "_is_verified"]: true,
								},
							}),

							thing_id: user_id,

							user_id: user_id,
						});
						/* todo new transaction must not repeat type = x when trying to update a thing 
					maybe type must be inside current value
					*/
						response.json({
							jwt: jwt_module.sign(
								{
									user_id,
									//exp: Math.round(new Date().getTime() / 1000 + 24 * 3600 * 3),
								},
								this.jwt_secret
							),
						});
					} else {
						response.status(400).json("sent combination was not valid.");
					}
				} else if (request.body.login_mode === "password_mode") {
					var filtered_user_things: any = this.cache.filter(
						(item) => item.thing_id === user_id
					);
					if (
						request.body.value ===
						filtered_user_things[0].thing.value.$user_private_data.value.password
					) {
						response.json({
							jwt: jwt_module.sign(
								{
									user_id,
								},
								this.jwt_secret
							),
						});
						return;
					} else {
						response.status(400).json("sent combination was not valid.");
						return;
					}
				}
			})
		);

		this.restful_express_app.post(
			"/send_verification_code",
			this.gen_lock_safe_request_handler(async (request: any, response: any) => {
				var user_id = this.flexible_user_finder(request.body.identifier);
				if (user_id === undefined) {
					response.json({});
					return;
				}

				//todo here i must send verf_code to the user through api request to sms web service
				response.status(503).json("couldnt able to send verification code ");
				return;
				/* 
				var verf_code_surface_item = this.cache.filter(
					(item: any) =>
						item.thing.type === "verification_code" &&
						item.thing.value.user_id === user_id
				)[0];
				if (verf_code_surface_item === undefined) {
					this.new_transaction({
						user_id,
						new_thing_creator: () => ({
							type: "verification_code",
							value: {
								user_id,
								value: gen_verification_code(),
							},
						}),
						thing_id: undefined,
					});
				} else {
					this.new_transaction({
						user_id,
						thing_id: verf_code_surface_item.thing_id,
						new_thing_creator: (prev_thing: any) => ({
							...prev_thing,
							value: {
								...prev_thing.value,
								value: gen_verification_code(),
							},
						}),
					});
				}
				response.json("verification_code was sent");
				return; */
			})
		);
		this.restful_express_app.get(
			"/files/:file_id",
			this.gen_lock_safe_request_handler(async (request: any, response: any) => {
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
						response.sendFile(
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
			})
		);
		this.restful_express_app.post(
			"/files",
			this.gen_lock_safe_request_handler(async (request, response) => {
				//saves the file with key = "file" inside sent form inside ./uploads directory
				//returns json : {file_id : string }
				//saved file name + extension is {file_id}-{original file name with extension }

				if (response.locals.user_id === undefined) {
					response.status(403).json("jwt is not provided in request's headers");
					return;
				}
				var { new_file_id, file_mime_type, originalFilename } = await new Promise<{
					file_mime_type: string;
					new_file_id: number;
					originalFilename: string;
				}>((resolve, reject) => {
					var f = formidable({
						uploadDir: path.resolve(this.absolute_paths.uploads_dir),
					});
					f.parse(request, (err: any, fields: any, files: any) => {
						if (err) {
							reject(err);
							return;
						}
						var tmp = this.cache.length + 1;
						var new_file_path = path.resolve(
							this.absolute_paths.uploads_dir,
							`${tmp}-${files["file"].originalFilename}`
						);
						fs.renameSync(files["file"].filepath, new_file_path);
						resolve({
							new_file_id: tmp,
							file_mime_type: files["file"].mimetype,
							originalFilename: files["file"].originalFilename,
						});
						return;
					});
				});
				this.new_transaction({
					new_thing_creator: (prev) => ({
						type: "meta",
						value: {
							file_id: new_file_id,
							file_privileges: {
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
				response.json(new_file_id);
			})
		);
		this.restful_express_app.post("/new_transaction", (request, response) => {
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
	new_user(username: string, password: string) {
		var new_user_id = this.new_transaction<user, undefined>({
			new_thing_creator: () => ({
				type: "user",
				value: {
					username,
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
				value: {
					password,
				},
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
					$user_private_data: `$$ref::${user_private_data_thing_id}`,
				},
			}),
			thing_id: new_user_id,
			user_id: new_user_id,
		});
		return new_user_id;
	}
	flexible_user_finder(identifier: string): number | undefined /* (no match) */ {
		var tmp: any = this.cache.filter((item: cache_item) => item.thing.type === "user");
		var all_values: string[] = [];
		tmp.forEach((item: any) => {
			all_values.push(
				...[
					item.thing.value.username,
					item.thing.value.$user_private_data.value.mobile,
					item.thing.value.$user_private_data.value.email_address,
					item.thing_id,
				].filter((i) => i !== undefined && i !== null)
			);
		});
		var matches_count = all_values.filter((value) => value == identifier).length;
		if (matches_count === 0) {
			return undefined;
		} else if (matches_count === 1) {
			var matched_user = tmp.find((item: any) => {
				return (
					[
						item.thing.value.username,
						item.thing.value.$user_private_data.value.mobile,
						item.thing.value.$user_private_data.value.email_address,
						item.thing_id,
					].find((i) => i == identifier) !== undefined
				);
			});

			return matched_user.thing_id;
		} else {
			throw "there is more than one match in valid search resources";
		}
	}

	new_transaction<ThingType extends thing, ThingId extends number | undefined>({
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
				transaction_diff
			) !== true
		) {
			throw new Error(
				"access denied. required privileges to insert new transaction were not met" +
					` user ${user_id} wanted to modify thing : ${thing_id || "undefined"}`
			);
		}

		if (validate_refs_values(new_thing) === false) {
			throw new Error(
				"this transaction will make the thing invalid when being tested against refs validation rules"
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
			this.check_lock({
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

		this.transactions.push(transaction);
		fs.writeFileSync(this.absolute_paths.store_file, JSON.stringify(this.transactions));

		this.onChanges.cache();
		this.onChanges.transactions();

		return transaction.thing_id;
	}
	calc_profile(profile_seed: profile_seed, transaction_limit: number | undefined): profile {
		return {
			...profile_seed,
			transactions: this.calc_user_discoverable_transactions(profile_seed.user_id).filter(
				(tr) => {
					if (transaction_limit === undefined) {
						return true;
					} else {
						return tr.id <= transaction_limit;
					}
				}
			),
		};
	}
	sync_websocket_client(websocket_client: websocket_client) {
		var prev: profiles = (websocket_client.prev_profiles_seed || []).map((seed) =>
			this.calc_profile(seed, websocket_client.last_synced_snapshot)
		);

		var current: profiles = (websocket_client.profiles_seed || []).map((profile_seed) =>
			this.calc_profile(profile_seed, undefined)
		);

		websocket_client.socket.emit("syncing_discoverable_transactions", getDiff(prev, current));
		websocket_client.last_synced_snapshot = Math.max(...this.transactions.map((i) => i.id));
	}
	add_socket(socket: Socket) {
		var new_websocket_client: websocket_client = {
			socket,
			profiles_seed: [],
			last_synced_snapshot: undefined,
		};
		this.websocket_clients.push(new_websocket_client);

		socket.on("sync_profiles", (profiles: profiles) => {
			try {
				for (var profile of profiles) {
					if (typeof profile.jwt === "string") {
						var decoded_jwt = jwt_module.verify(profile.jwt, this.jwt_secret);
						if (typeof decoded_jwt !== "string" /* this bool is always true */) {
							var { user_id } = decoded_jwt;
							if (user_id !== profile.user_id) {
								throw "jwt was verified but user id of profile does not match the user id inside the jwt";
							}
						}
					}
				}
				var t = this.websocket_clients.find((cl) => cl.socket === socket);
				if (t !== undefined) {
					t.prev_profiles_seed = t.profiles_seed;
					t.profiles_seed = profiles;
				} else {
					throw "freeflow internal error! tried to update profiles of a websocket which doest exist.";
				}

				//sending all discoverable transactions to that user (in diff format)
				this.sync_websocket_client(new_websocket_client);
			} catch (error) {
				console.error(error);
			}
		});
	}
}
