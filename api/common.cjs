var crypto = require("crypto");
var mysql = require("mysql");
require("dotenv").config();

var arr_last_item = (arr) => {
	return arr[arr.length - 1];
};

var hash_sha_256_hex = (input) => crypto.createHash("sha256").update(input).digest("hex");

function build_pyramid(data_array, identifier_prop_name = "id", parent_prop_name = "parent") {
	function calc_children(identifier) {
		if (data_array.filter((item) => item[parent_prop_name] === identifier).length === 0) {
			return undefined;
		} else {
			return data_array
				.filter((item) => item[parent_prop_name] === identifier)
				.map((item) => {
					var tmp = { children: calc_children(item[identifier_prop_name]) };
					tmp[identifier_prop_name] = item[identifier_prop_name];
					return tmp;
				});
		}
    }
    var pyramid = {}
    pyramid[identifier_prop_name] = data_array.find((item) => item[parent_prop_name] === null)[identifier_prop_name],
    pyramid.children = calc_children(data_array.find((item) => item[parent_prop_name] === null)[identifier_prop_name])
	
    return pyramid;
}
var pretty_stringify = (input) => JSON.stringify(input, null, 4);
function gen_verification_code() {
	return Math.floor(100000 + Math.random() * 900000);
}
module.exports = {
	arr_last_item,
	hash_sha_256_hex,
	pretty_stringify,
	build_pyramid,
	gen_verification_code,
};
