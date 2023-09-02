import jsonwebtoken from "jsonwebtoken";
import { homedir } from "os";
import path from "path";
import { existsSync, readFileSync } from "fs";
export function sign_jwt(jwt_secret, exp_days, payload) {
    return jsonwebtoken.sign(Object.assign(Object.assign({}, payload), (exp_days
        ? {
            exp: Math.round(new Date().getTime() / 1000 + exp_days * 24 * 3600),
        }
        : undefined)), jwt_secret);
}
export var data_dir_path = path.resolve(homedir(), ".freeflow_data");
export var env_file_path = path.join(data_dir_path, "env.json");
export var store_file_path = path.join(data_dir_path, "store.json");
export function env_vars() {
    if (existsSync(env_file_path) === false)
        throw "env file doesnt exist";
    return JSON.parse(readFileSync(env_file_path, "utf-8"));
}
