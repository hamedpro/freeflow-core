import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import os from "os";
var { frontend_port } = JSON.parse(
	fs.readFileSync(path.join(os.homedir(), "./.pink_rose_data/env.json"), "utf8")
);
var app = express();
app.use(express.static("./dist"));
app.use(cors());
app.all("/*", (req, res) => {
	res.sendFile(path.resolve("./dist/index.html"));
});
app.listen(Number(frontend_port));
