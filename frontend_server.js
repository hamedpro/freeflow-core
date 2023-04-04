import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
var { frontend_port } = JSON.parse(fs.readFileSync("env.json", "utf8"));
var app = express();
app.use(express.static("./dist"));
app.use(cors());
app.all("/*", (req, res) => {
	res.sendFile(path.resolve("./dist/index.html"));
});
app.listen(Number(frontend_port), () => {
	console.log(`frontend server started on port ${frontend_port}`);
});
