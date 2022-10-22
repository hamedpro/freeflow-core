require("dotenv").config();
var hash_sha_256_hex = require("./common.cjs").hash_sha_256_hex;
var express = require("express");
var cors = require("cors");
var response_manager = require("./express_response_manager.cjs");
var mysql = require("mysql");
var formidable = require("formidable");
var nodemailer = require("nodemailer");
var fs = require("fs");
//app.use(express.static("./uploaded/"));
var custom_upload = require("./nodejs_custom_upload.cjs").custom_upload;
var cq = require("./custom_query.cjs").custom_query; // cq stands for custom_query
var path = require("path");

function connect_to_db(pass_database = true) {
	var conf = {
		user: process.env.mysql_user,
		password: process.env.mysql_password,
		port: Number(process.env.mysql_port),
		host: process.env.mysql_host,
		multipleStatements: true,
	};
	if (pass_database) {
		conf["database"] = process.env.mysql_database;
	}
	return mysql.createConnection(conf);
	//add error handling for mysql createConnection
}
async function init() {
	["./uploaded"].forEach((path) => {
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	});

	var con = connect_to_db(false);

	var output = await cq(
		con,
		`
			create database if not exists ${process.env.mysql_database};
			use ${process.env.mysql_database};
			create table if not exists users(
				id int primary key auto_increment,
				username varchar(50) ,
				hashed_password text , 
				is_admin varchar(20) default "false",
				is_subscribed_to_email varchar(20) default "false",
				is_subscribed_to_sms varchar(20) default "false",
				email varchar(100),
				phone_number varchar(15),
				time varchar(20)
			);
		`
	);
	
	//todo also check inside the code for todos and make a  --
	//app for it
	if (output.error) {
		throw output.error;
	}
	con.end();
	//todo take care about length of texts and max length of cells
}
async function main() {
	var app = express();
	app.use(cors());
	app.use(express.json());
	try {
		await init()
		var con = connect_to_db();
	} catch (e) {
		throw 'problem occured when executing "init" function'
	}

	app.all("/api/", async (req, res) => {
		var params = { ...req.body, ...req.query };
	});

	var server = app.listen(process.env.api_port, () => {
		console.log(`server is listening on port ${process.env.api_port}`);
	});
}
module.exports = {
	main
}