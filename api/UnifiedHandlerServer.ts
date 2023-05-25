import cors from "cors";
import formidable from "formidable";
import jwt_module from "jsonwebtoken";
import express, { response } from "express";
import EditorJS from "@editorjs/editorjs";
//read README file : UnifiedHandlerSystem.md
import fs, { mkdirSync } from "fs";
import os from "os";
import { fileURLToPath } from "url";
import rdiff from "recursive-diff";
var { applyDiff, getDiff } = rdiff;
var unique_items_of_array = (array: (string | number)[]) =>
	array.filter((i, index) => array.indexOf(i) === index) as any;

import { Server, Socket } from "socket.io";
import { io } from "socket.io-client";
import path from "path";
import { pink_rose_export, pink_rose_import } from "./pink_rose_io.js";
import axios from "axios";
import {
	authenticated_websocket_client,
	cache_item,
	thing,
	transaction,
	user,
} from "./UnifiedHandler_types.js";
import { exit } from "process";
import { UnifiedHandlerCore } from "./UnifiedHandlerCore.js";
import {
	check_lock,
	new_transaction_privileges_check,
	rdiff_path_to_lock_path_format,
} from "./utils.js";
function gen_verification_code() {
	return Math.floor(100000 + Math.random() * 900000);
}

export class UnifiedHandlerServer extends UnifiedHandlerCore {
	authenticated_websocket_clients: authenticated_websocket_client[] = [];
	restful_express_app: express.Express;
	jwt_secret: string;
	websocket_api_port: number;
	restful_api_port: number;
	frontend_endpoint: string;
	pink_rose_data_dir_absolute_path: string;
	store_file_absolute_path: string;
	env_json_file_absolute_path: string;

	constructor() {
		super();
		var pink_rose_data_dir_absolute_path = (this.pink_rose_data_dir_absolute_path = path.join(
			os.homedir(),
			"./.pink_rose_data"
		));

		mkdirSync(path.join(pink_rose_data_dir_absolute_path, "./uploads"), { recursive: true });

		var store_file_absolute_path = (this.store_file_absolute_path = path.join(
			pink_rose_data_dir_absolute_path,
			"./store.json"
		));
		if (fs.existsSync(store_file_absolute_path) !== true) {
			fs.writeFileSync(store_file_absolute_path, JSON.stringify([], undefined, 4));
		}

		var env_json_file_absolute_path = (this.env_json_file_absolute_path = path.join(
			pink_rose_data_dir_absolute_path,
			"./env.json"
		));
		if (fs.existsSync(env_json_file_absolute_path) !== true) {
			console.log(
				`env.json does not exist here : ${env_json_file_absolute_path}. create it with proper properties then try again`
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
		} = JSON.parse(fs.readFileSync(env_json_file_absolute_path, "utf-8"));

		this.frontend_endpoint = frontend_endpoint;
		this.jwt_secret = jwt_secret;
		this.websocket_api_port = websocket_api_port;
		this.restful_api_port = restful_api_port;

		this.transactions = JSON.parse(fs.readFileSync(store_file_absolute_path, "utf-8"));

		this.onChanges.cache = this.onChanges.transactions = () => {
			for (var i of this.authenticated_websocket_clients) {
				this.sync_websocket_client(i);
			}
		};
		this.restful_express_app = express();
		this.restful_express_app.use(cors());
		this.restful_express_app.use(express.json());
		this.restful_express_app.post(
			"/register",
			async (
				request: Express.Request & { body: { username: string; password: string } },
				response: any
			) => {
				if (
					this.cache
						.filter((item: cache_item) => item.thing.type === "user")
						.map((item: any) => item.thing.current_state.username)
						.includes(request.body.username)
				) {
					response.status(400).json("username is taken");
				} else {
					var new_user_id = this.new_transaction<user, undefined>({
						new_thing_creator: () => ({
							type: "user",
							current_state: {
								username: request.body.username,
								password: request.body.password,
							},
						}),
						thing_id: undefined,
						user_id: undefined,
					});
					response.json({ jwt: jwt_module.sign({ user_id: new_user_id }, jwt_secret) });
				}
			}
		);
		this.restful_express_app.post("/login", async (request: any, response: any) => {
			var user_id = this.flexible_user_finder(request.body.identifier);
			if (user_id === undefined) {
				response.status(400).json("sent combination was not valid");
				return;
			}
			if (request.body.login_mode === "verf_code_mode") {
				var filtered_surface_cache: any = this.cache.filter((i: any) => {
					return (
						i.thing.type === "verification_code" &&
						i.thing.current_state.user_id === user_id
					);
				});

				if (filtered_surface_cache.length === 0) {
					response.status(400).json("sent combination was not valid");
					return;
				}
				if (filtered_surface_cache[0].thing.current_state.value === request.body.value) {
					this.new_transaction({
						new_thing_creator: (thing: any) => ({
							...thing,
							current_state: {
								...thing.current_state,
								[thing.current_state.kind + "_is_verified"]: true,
							},
						}),

						thing_id: user_id,

						user_id: undefined,
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

				if (request.body.value === filtered_user_things[0].thing.current_state.password) {
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
		});

		this.restful_express_app.post(
			"/send_verification_code",
			async (request: any, response: any) => {
				var user_id = this.flexible_user_finder(request.body.identifier);
				if (user_id === undefined) {
					response.json({});
					return;
				}

				//todo here i must send verf_code to the user through api request to sms web service
				response.status(503).json("couldnt able to send verification code ");
				return;

				var verf_code_surface_item = this.cache.filter(
					(item: any) =>
						item.thing.type === "verification_code" &&
						item.thing.current_state.user_id === user_id
				)[0];
				if (verf_code_surface_item === undefined) {
					this.new_transaction({
						user_id,
						new_thing_creator: (prev_thing: any) => ({
							type: "verification_code",
							current_state: {
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
							current_state: {
								...prev_thing.current_state,
								value: gen_verification_code(),
							},
						}),
					});
				}
				response.json("verification_code was sent");
				return;
			}
		);
		this.restful_express_app.get("/files/:file_id", async (request: any, response: any) => {
			response.sendFile(
				path.resolve(
					`./uploads/${fs
						.readdirSync("./uploads")
						.find((i) => i.startsWith(request.params.file_id))}`
				)
			);
		});
		this.restful_express_app.post("/files", async (request, response) => {
			//saves the file with key = "file" inside sent form inside ./uploads directory
			//returns json : {file_id : string }
			//saved file name + extension is {file_id}-{original file name with extension }
			var file_id = await new Promise((resolve, reject) => {
				var f = formidable({ uploadDir: "./uploads" });
				f.parse(request, (err: any, fields: any, files: any) => {
					if (err) {
						reject(err);
						return;
					}
					var file_id = `${new Date().getTime()}${Math.round(Math.random() * 10000)}`;
					var new_file_path = path.resolve(
						"./uploads",
						`${file_id}-${files["file"].originalFilename}`
					);

					fs.renameSync(files["file"].filepath, new_file_path);
					resolve(file_id);
					return;
				});
			});
			response.json({ file_id });
		});
		this.restful_express_app.post("/new_transaction", (request, response) => {
			if (
				/* always true condition (just a type guard) */ typeof request.headers.jwt ===
				"string"
			) {
				var decoded_jwt = jwt_module.decode(request.headers.jwt);
				if (
					/* always true condition (just a type guard) */ typeof decoded_jwt !== "string"
				) {
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
									decoded_jwt?.user_id /* it always have user_id and ?. is just for ts  */,
							})
						);
					} catch (error) {
						response.status(400).json(error);
					}
				}
			}
		});

		this.restful_express_app.listen(this.restful_api_port);

		var io = new Server(this.websocket_api_port, {
			cors: {
				origin: frontend_endpoint,
				methods: ["GET", "POST"],
			},
		});
		io.on("connection", (socket) => {
			this.add_socket(socket);
		});
	}
	flexible_user_finder(identifier: string): number | undefined /* (no match) */ {
		var tmp: any = this.cache.filter((item: cache_item) => item.thing.type === "user");
		var all_values: string[] = [];
		tmp.forEach((item: any) => {
			all_values.push(
				...[
					item.thing.current_state.username,
					item.thing.current_state.mobile,
					item.thing.current_state.email_address,
					item.thing_id,
				].filter((i) => i !== undefined && i !== null)
			);
		});
		var matches_count = all_values.filter((value) => value == identifier).length;
		if (matches_count === 0) {
			return undefined;
		} else if (matches_count === 1) {
			var matched_users = tmp.find((item: any) => {
				return (
					[
						item.thing.current_state.username,
						item.thing.current_state.mobile,
						item.thing.current_state.email_address,
						item.thing_id,
					].find((i) => i == identifier) !== undefined
				);
			});

			return matched_users[0].thing_id;
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
		user_id: number | undefined;
		/* 
			if user_id is passed undefined
			privilege checks are ignored and new transaction
			is done by system itself.
		*/
	}): number {
		var thing: ThingType | {} =
			typeof thing_id === "undefined"
				? {}
				: this.cache.filter((i) => i.thing_id === thing_id)[0].thing;

		var new_thing = new_thing_creator(thing);
		var transaction_diff = getDiff(thing, new_thing);

		if (
			this.new_transaction_privileges_check(
				user_id,
				thing_id,
				this.transactions,
				transaction_diff
			) !== true
		) {
			throw new Error(
				"access denied. required privileges to insert new transaction were not met"
			);
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
		};

		this.transactions.push(transaction);

		fs.writeFileSync(
			this.store_file_absolute_path,
			JSON.stringify(this.transactions, undefined, 4)
		);

		this.onChanges.cache();
		this.onChanges.transactions();

		return transaction.thing_id;
	}

	sync_websocket_client(websocket_client: authenticated_websocket_client) {
		if (websocket_client.last_synced_snapshot === undefined) {
			var diff_to_send = getDiff(
				[],
				this.calc_user_discoverable_transactions(websocket_client.user_id)
			);
			websocket_client.socket.emit("syncing_discoverable_transactions", diff_to_send);
		} else {
			var tmp: number = websocket_client.last_synced_snapshot;
			var diff_to_send = getDiff(
				this.calc_user_discoverable_transactions(websocket_client.user_id).filter(
					(transaction) => transaction.id <= tmp
				),
				this.calc_user_discoverable_transactions(websocket_client.user_id)
			);
			websocket_client.socket.emit("syncing_discoverable_transactions", diff_to_send);
		}
	}
	add_socket(socket: Socket) {
		socket.on("jwt", (jwt: string) => {
			try {
				var decoded_jwt = jwt_module.verify(jwt, this.jwt_secret);
				if (typeof decoded_jwt !== "string" /* this bool is always true */) {
					var { user_id } = decoded_jwt;
					var new_websocket_client: authenticated_websocket_client = {
						socket,
						user_id,
						last_synced_snapshot: undefined,
					};
					this.authenticated_websocket_clients.push(new_websocket_client);
					//sending all discoverable transactions to that user (in diff format)
					this.sync_websocket_client(new_websocket_client);
				}
			} catch (error) {
				console.error(error);
			}
		});
	}
}
