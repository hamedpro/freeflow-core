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


	app.post('/users', async (req,res) => {
		await db.collection('users').insertOne(req.body)
		res.end()
	})
	app.get('/users', async (req, res) => {
		res.json(await db.collection('users').find().toArray())
	})
	app.delete('/users/:username', async (req, res) => {
		//todo
	})

	app.post('/notes', async (req, res) => {
		await db.collection('notes').insertOne(req.body)
		res.end()
	})
	app.get('/notes', async (req, res) => {
		res.json(await db.collection('notes').find().toArray())
	})
	app.delete('/notes/:note_id', async (req, res) => {
		
	});
	app.patch('/notes/:note_id', async (req, res) => {
		
	});
	app.get('/notes/:note_id', async(req, res) => {
		
	});

	app.post('/workspaces', async (req, res) => {
		await db.collection('workspaces').insertOne(req.body)
		res.end()
	})
	app.get('/workspaces', async (req, res) => {
		res.json(await db.collection('workspaces').find().toArray())
	})


	app.get('/workspaces/:workspace_id', async (req, res) => {
		
	});
	app.patch('/workspaces/:workspace_id', async (req, res) => {
		
	});
	app.delete('/workspaces/:workspace_id', async (req, res) => {
		
	});


	app.post('/note_sections', async (req, res) => {
		await db.collection('note_sections').insertOne(req.body)
		res.end()
	})
	app.get('/note_sections', async (req, res) => {
		res.json(await db.collection('note_sections').find().toArray())
	})

	
	var server = app.listen(process.env.api_port, () => {
		console.log(`server started listening`);
	});
}
main()