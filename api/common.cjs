var crypto = require("crypto");
var mysql = require('mysql')
require('dotenv').config()

var arr_last_item = (arr) => {
	return arr[arr.length - 1];
};

var hash_sha_256_hex = (input) => crypto.createHash("sha256").update(input).digest("hex");

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
module.exports = {
	arr_last_item,
	hash_sha_256_hex,
	connect_to_db
};
