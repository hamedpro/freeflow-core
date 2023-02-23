import jwt from "jsonwebtoken";
import fs from "fs";
var { jwt_secret } = JSON.parse(fs.readFileSync("./env.json", "utf-8"));
export function jwt_middle_ware(request, response, next) {
	jwt.verify(request.headers.auth, jwt_secret);
	next();
}
