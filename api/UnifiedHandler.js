import fs from "fs";
import { MongoClient } from "mongodb";

var { frontend_port, api_port, api_endpoint, db_name, mongodb_url, jwt_secret } = JSON.parse(
	fs.readFileSync("./env.json", "utf-8")
);
var client = new MongoClient(mongodb_url);
var db = client.db(db_name);
export class UnifiedHandler {
	async load_db() {
		this.virtual_db = (await db.listCollections().toArray())
			.map((i) => i.name)
			.map(async (i) => await db.collection(i).find().toArray());
	}
	constructor(db) {
		this.db = db;
		this.load_db().then(() => {
			console.log(this.virtual_db);
		});
	}
}

new UnifiedHandler(db);
