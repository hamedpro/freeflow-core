var crypto = require("crypto");
var arr_last_item = (arr) => {
	return arr[arr.length - 1];
};
var hash_sha_256_hex = (input) => crypto.createHash("sha256").update(input).digest("hex");
module.exports = {
	arr_last_item,
	hash_sha_256_hex,
};
