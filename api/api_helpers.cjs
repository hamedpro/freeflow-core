var crypto = require("crypto");
require("dotenv").config();
function gen_verification_code() {
	return Math.floor(100000 + Math.random() * 900000);
}

module.exports = {
	gen_verification_code
};
