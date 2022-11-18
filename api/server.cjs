require("dotenv").config(); //some comment for test
var {hash_sha_256_hex,build_pyramid, gen_verification_code} = require("./common.cjs");
var express = require("express");
var cookieParser = require('cookie-parser')
var cors = require("cors");
var formidable = require("formidable");
var fs = require("fs");
//app.use(express.static("./uploaded/"));
var custom_upload = require("./nodejs_custom_upload.cjs").custom_upload;
var path = require("path");
var { MongoClient } = require('mongodb')
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
var db = client.db('pink_rose')

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
	app.use(cors({origin : "http://localhost:3000",credentials : true})); //todo read origin from env so when port or protocol changes it will keep going working properly 
	app.use(cookieParser())
	app.use(express.json());
	try {
		await init()
	} catch (e) {
		console.log(e)
		process.exit()
	}
	//todo use todos of my other applications
	/* todo validate the data and delete all extra fields and
	 ... before processing the request */
	app.all('/', async (req, res) => {
		console.log({
			info: '"/" was requested',
			cookies: req.cookies,
			body : req.body
		})
		res.json("server is up")
	})

	/* 
		to know how to use each route please 
		look at client.js file functions
	*/

	app.post('/users', async (req,res) => {
		await db.collection('users').insertOne(req.body)
		res.end()
	})
	app.get('/users', async (req, res) => {
		res.json(await db.collection('users').find().toArray())
	});
	app.get('/users/:username', async (req, res) => {
		res.json(await db.collection('users').findOne({...req.params}))
	})
	app.delete('/users/:username', async (req, res) => {
		//todo
	})
	app.post('/login_methods/password_based', async (req, res) => {
		var users = await db.collection('users').find().toArray()
		var kind_of_input = req.body['kind_of_input']
		var user = users.find(this_user => this_user[kind_of_input] == req.body[kind_of_input])
		if (user === undefined) {
			res.status(400).json('there is not any user even found with that details')
			return
		}
		res.json(user.password == req.body.password)
		//console.log(user)
	});
	app.post('/login_methods/send_verification_code', async (req, res) => {
		/* 
			how to use it : body should look like this : 
			{
				kind_of_input : "mobile" || "email_address" ||"username",
				"mobile" || "email_address" || "username" : "string",
			}
			if response code was not in successful range it has went wrong otherwise all is done
		*/
		var users = await db.collection('users').find().toArray()
		var kind_of_input = req.body['kind_of_input']
		var user = users.find(this_user => this_user[kind_of_input] == req.body[kind_of_input])
		if (user === undefined) {
			res.status(400).json('there is not any user even found with that details')
			return
		}
		switch (req.body.kind_of_input) {
			case "mobile":
				var verf_code = gen_verification_code()
				//send code to the user through api request to sms web service

				//deleting previous verf_code if present:
				if (await db.collection('verification_codes').findOne({ username: user.username }) !== null) {
					await db.collection('verification_codes').deleteOne({username : user.username})
				}
				
				await db.collection('verification_codes').insertOne({value : verf_code,username : user.username})
				// note : schema of collection 'verification_codes' : username : "string" , verf_code : 6-digit integer 
				res.json("verification_code was sent")
				return
			case "email_address":
				var verf_code = gen_verification_code()
				//send code to the user through api request to email sending web service

				//deleting previous verf_code if present:
				if (await db.collection('verification_codes').findOne({ username: user.username }) !== null) {
					await db.collection('verification_codes').deleteOne({username : user.username})
				}

				await db.collection('verification_codes').insertOne({value : verf_code,username : user.username})
				res.json("verification_code was sent")
				return 
			default:
				res.status(400).send() // in this route "kind_of_input" must be either mobile or email_address not anything else 
				return
		}
		
	});
	app.post('/login_methods/verification_code_test', async (req, res) => {
		var users = await db.collection('users').find().toArray()
		var kind_of_input = req.body['kind_of_input']
		var user = users.find(this_user => this_user[kind_of_input] == req.body[kind_of_input])
		if (user === undefined) {
			res.status(400).json('there is not any user even found with that details')
			return
		}
		var current_verification_code = await db.collection('verification_codes').findOne({ username: user.username })
		if (current_verification_code == null) {
			res.status(400).json('there is not any verification code sending request was done for this uesr please request a verification code first')
		}
		res.json(current_verification_code.value  == req.body.verf_code)
	});
	app.post('/users/:username/notes', async (req, res) => {
		await db.collection('notes').insertOne(req.body)
		res.end()
	})
	app.get('/users/:username/notes', async (req, res) => {
		res.json(await db.collection('notes').find().toArray())
	})
	app.delete('/users/:username/notes/:note_id', async (req, res) => {
		
	});
	app.patch('/users/:username/notes/:note_id', async (req, res) => {
		
	});

	app.post('/users/:username/workspaces', async (req, res) => {
		await db.collection('workspaces').insertOne(req.body)
		res.end()
	})
	app.get('/users/:username/workspaces', async (req, res) => {
		res.json(await db.collection('workspaces').find({creator : req.body.creator }).toArray())
	});
	app.patch('/users/:username/workspaces/:workspace_id', async (req, res) => {
		
	});
	app.delete('/users/:username/workspaces/:workspace_id', async (req, res) => {
		
	});
	app.post('/users/:username/notes/:note_id/note_sections', async (req, res) => {
		await db.collection('note_sections').insertOne({
			...req.body,
			username: req.params.username,
			note_id : req.params.note_id
		})
		res.end()
	})
	app.get('/users/:username/notes/:note_id/note_sections', async (req, res) => {
		res.json(await db.collection('note_sections').find({
			username: req.params.username
		}).sort({index : 1}).toArray().filter(item => String(item.note_id) == String(req.params.note_id)))
	})

	app.post('/users/:username/workflows/:workflow_id/tasks',async (req, res) => {
		await db.collection('tasks').insertOne(req.body)
		res.json({})
	});

	app.get('/users/:username/workflows/:workflow_id/tasks', async (req, res) => {
		//var filtered_tasks = 
		res.json((await db.collection('tasks').find({ creator: req.params.username }).toArray())
			.filter(item => String(item.workflow_id) == String(req.params.workflow_id)))
	});

	app.get('/users/:username/workflows/:workflow_id/tasks_pyramid', async (req, res) => {
		var tasks = await db.collection('tasks').find({creator : req.params.username}).toArray().filter(item => String(item.workflow_id) == String(req.params.workflow_id))
		res.json(build_pyramid(tasks))
	});
	app.get('/users/:username/workspaces/:workspace_id/workflows',async (req, res) => {
		var filtered_workflows = await db.collection('workflows').find({workspace_id : req.params.workspace_id}).toArray()
		res.json(filtered_workflows)
	});
	app.post('/users/:username/workspaces/:workspace_id/workflows',async (req, res) => {
		
	});
	app.get('/users/:username/workspaces/:workspace_id/workflows/:workflow_id/tasks', async(req, res) => {
		var filtered_tasks = await db.collection('tasks').find({creator : req.params.username,workflow_id : req.params.workflow_id}).toArray()
		res.json(filtered_tasks)
	});
	app.get('/users/:username/tasks', async (req, res) => {
		res.json(await db.collection('tasks').find({creator : req.params.username}).toArray())
		//todo add support to check also if username is not the creator but a member of that task result show up
	});
	app.post('/users/:username/tasks', async(req, res) => {
		await db.collection('tasks').insertOne({ ...req.body, creator :req.params.username})
	});
	app.get('/users/:username/tasks_pyramid', async (req, res) => {
		var tasks = await db.collection('tasks').find({ creator: req.params.username }).toArray()
		res.json(build_pyramid(tasks))
	});
	app.post(`/users/:creator/workspaces/:workspace_id/workflows/new`, async(req, res) => {
		await db.collection('workflows').insertOne({...req.body,username : req.params.creator,workspace_id : req.params.workspace_id})
		res.json({})
	});
	//important todo : res.end or res.json at the end of async requests becuse axios will await until this happens 
	var server = app.listen(process.env.api_port, () => {
		console.log(`server started listening`);
	});
}
main()