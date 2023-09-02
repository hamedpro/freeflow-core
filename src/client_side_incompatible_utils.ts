import jsonwebtoken from "jsonwebtoken";
import { homedir } from "os";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { env } from "./UnifiedHandler_types";
export function sign_jwt(jwt_secret: string, exp_days: number, payload: object) {
	return jsonwebtoken.sign(
		{
			...payload,
			...(exp_days
				? {
						exp: Math.round(new Date().getTime() / 1000 + exp_days * 24 * 3600),
				  }
				: undefined),
		},
		jwt_secret
	);
}
export var data_dir_path = path.resolve(homedir(), ".freeflow_data");
export var env_file_path = path.join(data_dir_path, "env.json");
export var store_file_path = path.join(data_dir_path, "store.json");
export function env_vars(): env {
	if (existsSync(env_file_path) === false) throw "env file doesnt exist";
	return JSON.parse(readFileSync(env_file_path, "utf-8"));
}
