var fs = require("fs");
var crypto = require("crypto");
var path = require('path')
var env_absolute_file_path = path.resolve(path.join(__dirname,"./.env"))
if (fs.existsSync(env_absolute_file_path)) {
    fs.rmSync(env_absolute_file_path,{force : true})
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
api_port=4000
api_endpoint=http://localhost:4000
db_name=pink_rose
frontend_port=3000
`;

fs.writeFileSync(env_absolute_file_path, string_to_write_in_dot_env);
