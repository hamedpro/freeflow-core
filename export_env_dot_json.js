import fs from "fs";

var result = JSON.parse(fs.readFileSync("./env.json", "utf8"));

const env = Object.keys(result)
	.map((key) => `${key}=${result[key]}`)
	.join("\n");

fs.writeFileSync(".env", env);
