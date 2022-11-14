require("dotenv").config();
var hash_sha_256_hex = require("./common.cjs").hash_sha_256_hex;
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
	app.get('/users/:username', async (req, res) => {
		res.json(await db.collection('users').find({...req.params}).toArray())
	})
	app.delete('/users/:username', async (req, res) => {
		//todo
	})


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
			...req.params
		})
		res.end()
	})
	app.get('/users/:username/notes/:note_id/note_sections', async (req, res) => {
		res.json(await db.collection('note_sections').find({
			...req.params
		}).toArray())
	})


	var server = app.listen(process.env.api_port, () => {
		console.log(`server started listening`);
	});
}
main()