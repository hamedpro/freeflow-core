import { check_being_collaborator, gen_verification_code } from "../common_helpers.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import formidable from "formidable";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import { is_there_any_conflict } from "../common_helpers.js";
import jwt from "jsonwebtoken";
var { frontend_port, api_port, api_endpoint, db_name, mongodb_url, jwt_secret } = JSON.parse(
	fs.readFileSync("./env.json", "utf-8")
);
const client = new MongoClient(mongodb_url);

var db = client.db(db_name);
async function init() {
	["./uploads"].forEach((path) => {
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	});
	//todo also check inside the code for todos and make a  --
	//app for it
	//todo take care about length of texts and max length of cells
}
var app = express();
app.use(cors()); //todo read origin from env so when port or protocol changes it will keep going working properly
app.use(cookieParser());
app.use(express.json());
try {
	await init();
} catch (e) {
	console.log(e);
	process.exit();
}
//todo use todos of my other applications
/* todo validate the data and delete all extra fields and
	 ... before processing the request */
app.all("/", async (req, res) => {
	var task = req.headers.task;
	var body = req.body;

	if (task === undefined) {
		res.json(`there is not any task in request's body`);
	} else if (task === "auth") {
		var user = await db.collection("users").findOne({ _id: new ObjectId(req.body.user_id) });

		if (req.body.verf_code !== undefined) {
			var current_verification_code = await db
				.collection("verification_codes")
				.findOne({ user_id: user._id });
			if (current_verification_code == null) {
				res.status(400).json(
					"there is not any verification code sending request was done for this uesr please request a verification code first"
				);
			}
			if (current_verification_code.value == req.body.verf_code) {
				var update_filter = { _id: new ObjectId(req.body.user_id) };
				var update_object = {};
				update_object[current_verification_code.kind + "_is_verified"] = true;
				await db.collection("users").updateOne(update_filter, { $set: update_object });
				console.log({ update_filter, update_object });
				res.json(true);
			} else {
				res.json(false);
			}
		} else if (req.body.password !== undefined) {
			res.json(user.password == req.body.password);
		}
	} else if (task === "send_verification_code") {
		// body :{ kind : "mobile"  || "email_address" , user_id : string}
		var user = await db.collection("users").findOne({ _id: new ObjectId(req.body.user_id) });
		if (user === undefined) {
			res.status(400).json("there is not any user even found with that details");
			return;
		}
		switch (req.body.kind) {
			case "mobile":
				var verf_code = gen_verification_code();
				//send code to the user through api request to sms web service

				//deleting previous verf_code if present:
				if (
					(await db.collection("verification_codes").findOne({ user_id: user._id })) !==
					null
				) {
					await db.collection("verification_codes").deleteOne({ user_id: user._id });
				}

				await db
					.collection("verification_codes")
					.insertOne({ value: verf_code, user_id: user._id, kind: req.body.kind });
				res.json("verification_code was sent");
				break;
			case "email_address":
				var verf_code = gen_verification_code();
				//send code to the user through api request to email sending web service

				//deleting previous verf_code if present:
				if (
					(await db.collection("verification_codes").findOne({ user_id: user._id })) !==
					null
				) {
					await db.collection("verification_codes").deleteOne({ user_id: user._id });
				}
				await db
					.collection("verification_codes")
					.insertOne({ value: verf_code, user_id: user._id, kind: req.body.kind });
				res.json("verification_code was sent");
				break;
			default:
				res.status(400).send();
				break;
		}
	} else if (task === "flexible_user_finder") {
		var users = await db.collection("users").find().toArray();
		var all_values = [];
		users.forEach((user) => {
			all_values.push(user._id.toString(), user.username, user.mobile, user.email_address);
		});
		var matches_count = all_values.filter((value) => value == req.body.value).length;
		if (matches_count === 0) {
			res.status(400).json({
				status: 2,
				info: "there is more not any match in valid search resources",
			});
		} else if (matches_count === 1) {
			var matched_user = users.find((user) => {
				var tmp = [user.email_address, user.mobile, user._id.toString(), user.username];
				console.log({ list: tmp, value: req.body.value });
				return tmp.includes(req.body.value);
			});
			res.json(matched_user);
		} else {
			res.status(400).json({
				status: 3,
				info: "there is more than one match in valid search resources",
			});
		}
	} else if (task === "get_collection") {
		//body should be like this :{collection_name : string ,filters : {}}
		var filters = req.body.filters;
		if (Object.keys(filters).includes("_id")) {
			filters["_id"] = new ObjectId(filters["_id"]);
		}
		var tasks = await db.collection(req.body.collection_name).find(filters).toArray();
		res.json(tasks);
	} else if (task === "new_document") {
		//body should be like this : {collection_name : string , document : object}
		var inserted_row = await db
			.collection(req.body.collection_name)
			.insertOne(req.body.document);
		res.json(inserted_row.insertedId);
	} else if (task === "update_document") {
		//body must be like : {collection : string,update_filter : object, update_set : object}
		var update_filter = req.body.update_filter;
		if (update_filter._id !== undefined) {
			update_filter._id = new ObjectId(update_filter._id);
		}
		var update_statement = await db
			.collection(req.body.collection)
			.updateOne(update_filter, { $set: req.body.update_set });
		res.json(update_statement);
	} else if (task === "delete_document") {
		//body should look like this : {filter_object : object , collection_name : string}
		var filters = req.body.filters;
		if (Object.keys(filters).includes("_id")) {
			filters["_id"] = new ObjectId(filters["_id"]);
		}
		res.json(await db.collection(req.body.collection_name).deleteOne(filters));
	} else if (task === "mark_task_as_done") {
		//body should be like this : {task_id : string}
		//first check if we do this there will be any conflict or not
		var events = await db.collection("events").find().toArray();
		var this_task = await db
			.collection("tasks")
			.findOne({ _id: new ObjectId(req.body.task_id) });

		if (
			is_there_any_conflict({
				end: this_task.end_date,
				end: this_task.start_date,
				items: events,
			})
		) {
			res.json({
				has_error: true,
				error: "if this task's done status change to true there will be a conflict between this new done task and an existing event",
			});
			return;
		}
		await db
			.collection("tasks")
			.updateOne({ _id: new ObjectId(req.body.task_id) }, { $set: { is_done: true } });
		res.json({});
	} else if (task === "custom_delete") {
		//how to use it -> to delete a pack with id=foo -> context = "packs", id = "foo"
		//possible options for context : "packs" , "notes" , "resources" , "tasks"
		var { context, id } = req.body;
		async function delete_pack(pack_id) {
			await db.collection("packs").deleteOne({ _id: new ObjectId(pack_id) });
			await db.collection("notes").deleteMany({ pack_id });
			await db.collection("tasks").deleteMany({ pack_id });

			var resources = await db.collection("resources").find({ pack_id }).toArray();
			for (var resource in resources) {
				console.log(resource);
				var resource_file_path = path.resolve(
					"./uploads",
					fs.readdirSync("./uploads").find((i) => i.startsWith(resource.file_id))
				);
				fs.rmSync(resource_file_path);
				await db.collection("resources").deleteOne({ _id: new ObjectId(resource._id) });
			}
			for (var pack of await db.collection("packs").find({ pack_id }).toArray()) {
				await delete_pack(pack._id);
			}
		}
		switch (context) {
			case "packs":
				await delete_pack(id);
				break;
			case "notes":
				await db.collection("notes").deleteOne({ _id: new ObjectId(id) });
				var all_tasks = await db.collection("tasks").find().toArray();
				for (var task of all_tasks.filter((i) => i.linked_notes.includes(id))) {
					await db
						.collection("tasks")
						.updateOne(
							{ _id: new ObjectId(task._id) },
							{ $set: { linked_notes: task.linked_notes.filter((i) => i !== id) } }
						);
				}
				break;
			case "resources":
				var file_id = (await db.collection("resources").findOne({ _id: new ObjectId(id) }))
					.file_id;
				await db.collection("resources").deleteOne({ _id: new ObjectId(id) });
				var tmp = fs.readdirSync("./uploads").find((i) => i.startsWith(file_id));
				var resource_file_path = path.resolve("./uploads", tmp);
				fs.rmSync(resource_file_path);
				break;
			case "tasks":
				await db.collection("tasks").deleteOne({ _id: new ObjectId(id) });
				break;
			case "events":
				await db.collection("events").deleteOne({ _id: new ObjectId(id) });
				break;
		}
		res.json({});
	} else if (task === "custom_get_collection") {
		//lets explain what it does by an example :
		//if context is "packs" and user_id is 'something' :
		//it returns all packs which this user is a collaborator of them
		//and also this is true about tasks , resources , notes
		var result = (await db.collection(req.body.context).find().toArray()).filter((item) =>
			check_being_collaborator(item, req.body.user_id)
		);
		res.json(result);
	} else {
		res.json('unknown value for "task"');
	}
});
//todo add try catch blocks for all possible tasks
/* 
		to know how to use each route please 
		look at client.js file functions
	*/

//important todo : res.end or res.json at the end of async requests becuse axios will await until this happens

//starting api v2 routes :
app.post("/v2/auth/password_verification", async (request, response) => {
	var user = await db.collection("users").findOne({ _id: new ObjectId(request.body.user_id) });
	if (user === null) {
		response.status(404).json("user you are looking for doesnt exist");
		return;
	}

	if (request.body.password === user.password) {
		response.json({
			verified: true,
			jwt: jwt.sign(
				{
					user_id: user._id,
				},
				jwt_secret
			),
		});
		return;
	} else {
		response.json({
			verified: false,
		});
		return;
	}
});
app.post("/v2/auth/verification_code_verification", async (request, response) => {
	var current_verification_code_document = await db
		.collection("verification_codes")
		.findOne({ user_id: request.body.user_id });
	if (current_verification_code_document === null) {
		response
			.status(400)
			.json(
				"there is not any verification code sending request was done for this uesr please request a verification code first"
			);
		return;
	}
	if (current_verification_code_document.value == request.body.verf_code) {
		var update_filter = { _id: new ObjectId(request.body.user_id) };
		var update_object = {};
		update_object[current_verification_code_document.kind + "_is_verified"] = true;
		await db.collection("users").updateOne(update_filter, { $set: update_object });
		response.json({
			verified: true,
			jwt: jwt.sign(
				{
					user_id: request.body.user_id,
				},
				jwt_secret
			),
		});
	} else {
		response.json({
			verified: false,
		});
	}
});
app.post("/v2/auth/send_verification_code", async (request, response) => {
	// body :{ kind : "mobile"  || "email_address" , user_id : string}
	/* response
		.status(503)
		.json(
			"email sending is broken or sms sending service is broken. you can try again later ..."
		);
	return; */

	var verf_code = gen_verification_code();

	//todo here i must send verf_code to the user through api request to sms web service

	await db
		.collection("verification_codes")
		.updateOne(
			{ user_id: request.body.user_id, kind: request.body.kind },
			{ $set: { kind: request.body.kind, user_id: request.body.user_id, value: verf_code } },
			{ upsert: true }
		);

	response.json("verification_code was sent");
});
app.get("/v2/files/:file_id", async (request, response) => {
	response.sendFile(
		path.resolve(
			`./uploads/${fs
				.readdirSync("./uploads")
				.find((i) => i.startsWith(request.params.file_id))}`
		)
	);
});
app.post("/v2/files", async (request, response) => {
	//saves the file with key = "file" inside sent form inside ./uploads directory
	//returns json : {file_id : string }
	//saved file name + extension is {file_id}-{original file name with extension }
	var file_id = await new Promise((resolve, reject) => {
		var f = formidable({ uploadDir: "./uploads" });
		f.parse(request, (err, fields, files) => {
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
app.post(
	/v2\/(users|messages|note_commits|packs|notes|tasks|resources|events|calendar_categories|verification_codes)/,
	async (request, response) => {
		await db.collection(request.params["0"]).insertOne(request.body);
		response.json("ok");
		return;
	}
);
app.get(
	/v2\/(users|messages|note_commits|packs|notes|tasks|resources|events|calendar_categories|verification_codes)/,
	async (request, response) => {
		response.json(await db.collection(request.params["0"]).find().toArray());
		return;
	}
);
app.listen(api_port, () => {
	console.log(`server started listening`);
});
