require("dotenv").config();
var {hash_sha_256_hex,build_pyramid} = require("./common.cjs");
var express = require("express");
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
	app.use(cors());
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
		res.json(await db.collection('users').find().toArray()).end()
	});
	app.get('/users/:username', async (req, res) => {
		res.json(await db.collection('users').find({...req.params}).toArray())
	})
	app.delete('/users/:username', async (req, res) => {
		//todo
	})
	app.get('/users/:username/login', async(req, res) => {
		var user = await db.collection('users').findOne({ username: req.params.username })
		res.json(user !== null && user.password === req.body.password).end()
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
		res.end()
	});

	app.get('/users/:username/workflows/:workflow_id/tasks',async (req, res) => {
		res.json(await db.collection('tasks').find({creator : req.params.username}).toArray().filter(item => String(item.workflow_id) == String(req.params.workflow_id))
		)
	});

	app.get('/users/:username/workflows/:workflow_id/tasks_pyramid', async (req, res) => {
		var tasks = await db.collection('tasks').find({creator : req.params.username}).toArray().filter(item => String(item.workflow_id) == String(req.params.workflow_id))
		res.json(build_pyramid(tasks))
	});
	app.get('/users/:username/tasks', async (req, res) => {
		res.json(await db.collection('tasks').find({creator : req.params.username}).toArray())
		//todo add support to check also if username is not the creator but a member of that task result show up
	});
	app.get('/users/:username/tasks_pyramid', async (req, res) => {
		var tasks = await db.collection('tasks').find({ creator: req.params.username }).toArray()
		res.json(build_pyramid(tasks))
	});
	var server = app.listen(process.env.api_port, () => {
		console.log(`server started listening`);
	});
}
main()