import { check_being_collaborator, gen_verification_code } from "../common_helpers.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import formidable from "formidable";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { pink_rose_export, pink_rose_import } from "./pink_rose_io.js";
var { frontend_port, api_port, api_endpoint, db_name, mongodb_url, jwt_secret } = JSON.parse(
	fs.readFileSync("./env.json", "utf-8")
);
const client = new MongoClient(mongodb_url);

var db = client.db(db_name);

var app = express();
app.use(cookieParser());
app.use(express.json());

["./uploads"].forEach((path) => {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
});
//todo use todos of my other applications
/* todo validate the data and delete all extra fields and
... before processing the request */

//todo add try catch blocks for all possible tasks
/* 
	to know how to use each route please 
	look at client.js file functions
*/
//important todo : res.end or res.json at the end of async requests becuse axios will await until this happens

app.listen(api_port, () => {
	console.log(`server started listening`);
});
