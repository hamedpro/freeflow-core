require("dotenv").config(); //some comment for test
var { hash_sha_256_hex, build_pyramid, gen_verification_code } = require("./common.cjs");
var express = require("express");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var formidable = require("formidable");
var fs = require("fs");
//app.use(express.static("./uploaded/"));
var custom_upload = require("./nodejs_custom_upload.cjs").custom_upload;
var path = require("path");
var { MongoClient, ObjectId } = require("mongodb");
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
var db = client.db("pink_rose");
async function init() {
	["./uploaded"].forEach((path) => {
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	});
	//todo also check inside the code for todos and make a  --
	//app for it
	//todo take care about length of texts and max length of cells
}
async function main() {
	var app = express();
	app.use(cors({ origin: "http://localhost:3000", credentials: true })); //todo read origin from env so when port or protocol changes it will keep going working properly
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
		} else if (task === "new_user") {
			var operation = await db.collection("users").insertOne(body);
			res.json(operation.insertedId);
		} else if (task === "get_users") {
			// about filters : it doesnt work for _id
			//becuse it should use ObjectId (todo )
			var filters = req.body.filters === undefined ? {} : req.body.filters;
			if (Object.keys(filters).includes("_id")) {
				filters["_id"] = ObjectId(filters["_id"]);
			}
			var users = await db.collection("users").find(filters).toArray();
			res.json(users);
		} else if (task === "delete_user") {
			res.json(await db.collection("users").deleteOne({ _id: ObjectId(req.body.user_id) }));
		} else if (task === "auth") {
			var user = await db
				.collection("users")
				.findOne({ _id: ObjectId(req.body.user_id) })

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
					var update_filter = { user_id: req.body.user_id };
					var update_object = {};
					update_object[current_verification_code.kind + "_is_verified"] = true;
					await db.collection("users").updateOne(update_filter, { $set: update_object });
					res.json(true);
				} else {
					res.json(false);
				}
			} else if (req.body.password !== undefined) {
				res.json(user.password == req.body.password);
			}
		} else if (task === "send_verification_code") {
			// body :{ kind : "mobile"  || "email_address" , user_id : string}
			var user = await db
				.collection("users")
				.findOne({ _id: ObjectId(req.body.user_id) })
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
						(await db
							.collection("verification_codes")
							.findOne({ user_id: user._id })) !== null
					) {
						await db.collection("verification_codes").deleteOne({ user_id: user._id });
					}

					await db
						.collection("verification_codes")
						.insertOne({ value: verf_code, user_id: user._id, kind: req.body.kind });
					res.json("verification_code was sent");
				case "email_address":
					var verf_code = gen_verification_code();
					//send code to the user through api request to email sending web service

					//deleting previous verf_code if present:
					if (
						(await db
							.collection("verification_codes")
							.findOne({ user_id: user._id })) !== null
					) {
						await db.collection("verification_codes").deleteOne({ user_id: user._id });
					}
					await db
						.collection("verification_codes")
						.insertOne({ value: verf_code, user_id: user._id, kind: req.body.kind });
					res.json("verification_code was sent");
				default:
					res.status(400).send();
			}
		} else if (task === "new_note") {
			var new_inserted_row = await db.collection("notes").insertOne(req.body)
			res.json(new_inserted_row.insertedId)
		} else if (task === "get_user_notes") {
			res.json(await db.collection("notes").find({creator_user_id : req.body.creator_user_id}).toArray());
		} else if (task === "new_workspace") {
			var inserted_row = await db.collection("workspaces").insertOne(req.body);
			res.json(inserted_row.insertedId)
		} else if (task === "get_user_workspaces") {
			res.json(
				await db.collection("workspaces").find({ creator_user_id: req.body.creator_user_id }).toArray()
			);
		} else if (task === "new_note_section") {
			var inserted_row = await db.collection("note_sections").insertOne(req.body);
			res.json(inserted_row.insertedId)
		} else if (task === "get_note_sections") {
			res.json(
					await db
						.collection("note_sections")
						.find({
							note_id : req.body.note_id
						})
						.sort({ index: 1 })
						.toArray()
			);
		} else if (task === "new_task") {
			var inserted_row = await db.collection("tasks").insertOne(req.body)
			res.json(inserted_row.insertedId)
		} else if (task === "get_tasks") {
			var tasks = await db.collection("tasks").find(req.body.filters).toArray()
			res.json(
				req.body.pyramid_mode === true ? build_pyramid(tasks) : tasks
			);
			//todo add support to check also if username is not the creator but a member of that task result show up (also for notes )
		} else if (task === "get_workspace_workflows") {
			var filtered_workflows = await db
				.collection("workflows")
				.find({workspace_id: req.body.workspace_id})
				.toArray();
			res.json(filtered_workflows);
		} else if (task === "new_workflow") {
			var inserted_row = await db.collection("workflows").insertOne(req.body);
			res.json(inserted_row.insertedId);
		} else if (task === "update_user") {
			try {
				//body must be like : {user_id , kind : db_column_name,new_value}
				var update_object = {};
				update_object[req.body.kind] = req.body.new_value;
				var update_statement = await db
					.collection("users")
					.updateOne({ _id: ObjectId(req.body.user_id) }, { $set: update_object });
				res.json(update_statement);
			} catch (error) {
				console.log(error);
				res.status(500).json(error);
			}
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
	var server = app.listen(process.env.api_port, () => {
		console.log(`server started listening`);
	});
}
main();
