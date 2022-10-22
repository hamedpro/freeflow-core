var fs = require("fs");
var crypto = require("crypto");
if (fs.existsSync("./.env")) {
	fs.rmSync("./.env");
}

var ACCESS_TOKEN_SECRET = crypto.randomBytes(20).toString("hex");
var PASSWORD_HASHING_SECRET = crypto.randomBytes(20).toString("hex");
var REFRESH_TOKEN_SECRET = crypto.randomBytes(20).toString("hex");
var SUPER_ADMIN_ACCESS_TOKEN = crypto.randomBytes(20).toString("hex");

var string_to_write_in_dot_env = `
ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}
PASSWORD_HASHING_SECRET=${PASSWORD_HASHING_SECRET}
REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
SUPER_ADMIN_ACCESS_TOKEN=${SUPER_ADMIN_ACCESS_TOKEN}
`;
process.argv.slice(2,process.argv.length ).forEach(i => {
	string_to_write_in_dot_env += 
	`
	${i}
	`
})
fs.writeFileSync("./.env", string_to_write_in_dot_env);
