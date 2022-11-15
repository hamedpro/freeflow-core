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
function build_pyramid(data_array) {
    //each record should have these props : parent , id
    function calc_children(id) {
        //id is id of item which we are going to calc its children
        if (data_array.filter(item => item.parent === id).length === 0) {
            return undefined
        } else {
            return data_array.filter(item => item.parent === id).map(item => {
            return {
                id: item.id,
                children : calc_children(item.id)
            }
        })
        }
        
    }
    var pyramid = {
        id: data_array.find(item => item.parent === null)['id'],
        children : calc_children(data_array.find(item => item.parent === null)['id'])
    }
    return pyramid
}
var pretty_stringify = (input) => JSON.stringify(input, null, 4)

module.exports = {
	arr_last_item,
	hash_sha_256_hex,
	connect_to_db,
	pretty_stringify,
	build_pyramid
};
