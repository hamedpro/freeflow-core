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
var unique_items_of_array = (
	array: (string | number)[] //todo : it may not work for array containing anything other than numbers or string
) => array.filter((i, index) => array.indexOf(i) === index) as any;

import { Server, Socket } from "socket.io";
import { io } from "socket.io-client";
import path from "path";
import { pink_rose_export, pink_rose_import } from "./pink_rose_io.js";
import axios from "axios";
import {
	authenticated_websocket_client,
	meta_lock,
	surface_cache_item,
	thing,
	transaction,
	user,
} from "./UnifiedHandler_types.js";
import { exit } from "process";
function gen_verification_code() {
	return Math.floor(100000 + Math.random() * 900000);
}

export class UnifiedHandlerServer {
	//todo i tested and there was 2 loop iterations with same result for new Date().getTime()
	//make sure we can always store everything (including transactions in their exact order )
	//there must be always just a single unified handler db connected to a single mongo db collection
	onChange: () => void;
	virtual_transactions: transaction[];
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
		var pink_rose_data_dir_absolute_path = path.join(os.homedir(), "./.pink_rose_data");
		this.pink_rose_data_dir_absolute_path = pink_rose_data_dir_absolute_path;

		mkdirSync(path.join(pink_rose_data_dir_absolute_path, "./uploads"), { recursive: true });

		var store_file_absolute_path = path.join(pink_rose_data_dir_absolute_path, "./store.json");
		this.store_file_absolute_path = store_file_absolute_path;
		if (fs.existsSync(store_file_absolute_path) !== true) {
			fs.writeFileSync(store_file_absolute_path, JSON.stringify([]));
		}

		var env_json_file_absolute_path = path.join(pink_rose_data_dir_absolute_path, "./env.json");
		this.env_json_file_absolute_path = env_json_file_absolute_path;
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

		this.virtual_transactions = JSON.parse(fs.readFileSync(store_file_absolute_path, "utf-8"));

		this.onChange = () => {
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
					this.surface_cache
						.filter((item: surface_cache_item) => item.thing.type === "user")
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
				var filtered_surface_cache: any = this.surface_cache.filter((i: any) => {
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
								user_id: request.body.user_id,
								//exp: Math.round(new Date().getTime() / 1000 + 24 * 3600 * 3),
							},
							this.jwt_secret
						),
					});
				} else {
					response.status(400).json("sent combination was not valid.");
				}
			} else if (request.body.login_mode === "password_mode") {
				var filtered_user_things: any = this.surface_cache.filter(
					(item) => item.thing_id === user_id
				);

				if (request.body.value === filtered_user_things[0].thing.current_state.password) {
					response.json({
						jwt: jwt_module.sign(
							{
								user_id: filtered_user_things[0].thing.current_state.user_id,
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

				var verf_code_surface_item = this.surface_cache.filter(
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
		this.restful_express_app.get("/export_unit", async (request, response) => {
			//requested url must be like :
			// `/v2/export_unit?unit_id=${pack_id}&unit_context=packs`
			var archive_filename = await pink_rose_export({
				db: "tmp",
				unit_id: request.query.unit_id,
				unit_context: request.query.unit_context,
				uploads_dir_path: "./uploads",
			});
			await new Promise((resolve, reject) => {
				response.sendFile(path.resolve(archive_filename), (err) => {
					if (err) {
						reject(err);
					} else {
						resolve("done!");
					}
				});
			});

			fs.rmSync(archive_filename, { force: true, recursive: true });
		});
		this.restful_express_app.post("/import_exported_file", async (request, response) => {
			try {
				var uploaded_files = fs.readdirSync("./uploads");
				var exported_file_path = path.resolve(
					"./uploads",
					uploaded_files.filter((i) => i.startsWith(request.body.file_id))[0]
				);
				await pink_rose_import({
					db: "tmp",
					source_file_path: exported_file_path,
					files_destination_path: "./uploads",
				});
				fs.rmSync(exported_file_path, { force: true, recursive: true });
				response.json("done");
			} catch (error) {
				console.log(error);
				response.status(500).json(error);
			}
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
						this.new_transaction({
							new_thing_creator: (prev_thing: any) =>
								applyDiff(prev_thing, request.body.diff),
							thing_id: request.body.thing_id,
							user_id:
								decoded_jwt?.user_id /* it always have user_id and ?. is just for ts  */,
						});
						response.json("done");
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
	flexible_user_finder(identifier: string): number | undefined /* no match */ {
		var tmp: any = this.surface_cache.filter(
			(item: surface_cache_item) => item.thing.type === "user"
		);
		var all_values: string[] = [];
		tmp.forEach((item: any) => {
			all_values.push(
				...[
					item.thing.current_state.username,
					item.thing.current_state.mobile,
					item.thing.current_state.email_address,
					item.thing_id,
				]
					.filter((i) => i !== undefined)
					.map((i) => String(i))
			);
		});
		var matches_count = all_values.filter((value) => value === identifier).length;
		if (matches_count === 0) {
			return undefined;
		} else if (matches_count === 1) {
			
			var matched_users = tmp.filter((item: any) => {
				return [
					item.thing.current_state.username,
					item.thing.current_state.mobile,
					item.thing.current_state.email_address,
					item.thing_id,
				]
					.filter((i) => i !== undefined)
					.map((i) => String(i))
					.includes(identifier);
			});
			return matched_users[0].thing_id;
		} else {
			throw "there is more than one match in valid search resources";
		}
	}
	check_lock({
		user_id,
		thing_id,
	}: {
		thing_id: number | undefined;
		user_id: number | undefined;
	}): boolean {
		if (typeof thing_id === "undefined") return true;
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

	check_privilege(
		user_id: number | undefined,
		thing_id: number | undefined,
		job: "write" | "read"
	): boolean {
		if (typeof thing_id === "undefined") return true;
		if (user_id === undefined) return true;
		/* returns whether the user has privilege of doing specified "job" to that thing */
		var privilege_thing = this.surface_cache.find(
			(i: surface_cache_item) =>
				i.thing.type === "meta/privileges" && i.thing.current_state.for === thing_id
		);
		if (privilege_thing === undefined) {
			return true;
		} else {
			var privilege: any = privilege_thing.thing.current_state;
		}

		var collaborators_thing: any = this.surface_cache.find(
			(i: surface_cache_item) =>
				i.thing.type === "meta/collaborators" && i.thing.current_state.for === thing_id
		);

		var collaborators = collaborators_thing.current_state.value;

		var user_thing: any = this.surface_cache.find(
			(i: surface_cache_item) => i.thing.type === "user" && i.thing_id === user_id
		);
		var user = user_thing.current_state;
		/* 	priority of admin privilege on something is higher.
			it means if its said that admin has write access but
			the admin is also a non-owner collaborator and its said
			they have only read access that user can write there.
		*/
		if (user.is_admin === true) {
		}
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
		return true;
	}
	get surface_cache(): surface_cache_item[] {
		//returns an array which contains a mapping
		// from thing_ids each to its calculated version

		return unique_items_of_array(this.virtual_transactions.map((i) => i.thing_id)).map(
			(thing_id: number) => this.calc_thing_state(thing_id)
		);
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
				: this.surface_cache.filter((i) => i.thing_id === thing_id)[0].thing;

		var new_thing = new_thing_creator(thing);
		//applies transaction to virtual_transactions then
		//writes virtual_transactions to correct store.json
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
			diff: getDiff(thing, new_thing),
			thing_id: typeof thing_id === "undefined" ? this.surface_cache.length + 1 : thing_id,
			id: this.virtual_transactions.length + 1,
		};

		this.virtual_transactions.push(transaction);

		fs.writeFileSync(this.store_file_absolute_path, JSON.stringify(this.virtual_transactions));

		this.onChange();
		return transaction.thing_id;
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
	sync_websocket_client(websocket_client: authenticated_websocket_client) {
		if (websocket_client.last_synced_snapshot === undefined) {
			var diff_to_send = getDiff(
				[],
				this.calc_discoverable_transactions(websocket_client.user_id)
			);
			websocket_client.socket.emit("syncing_discoverable_transactions", diff_to_send);
		} else {
			var tmp: number = websocket_client.last_synced_snapshot;
			var diff_to_send = getDiff(
				this.calc_discoverable_transactions(websocket_client.user_id).filter(
					(transaction) => transaction.id <= tmp
				),
				this.calc_discoverable_transactions(websocket_client.user_id)
			);
			websocket_client.socket.emit("syncing_discoverable_transactions", diff_to_send);
		}
	}
	add_socket(socket: Socket) {
		//adding event listener of to listen to incoming
		//transaction insertion requests from this client
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
