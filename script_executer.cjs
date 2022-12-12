var {exec} = require("child_process");
var fs = require("fs");
var mode = process.argv[2] == "dev" ? "dev" : "start";

var { frontend_port, api_port, api_endpoint, db_name } = JSON.parse(
	fs.readFileSync("./env.json", "utf-8")
);
var start_script = `(node ./api/server.cjs) & (rm -rf ./dist && npx tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css && vite build --base ./ ) && (http-server --cors -p ${frontend_port} -c 1 ./dist)`;
//todo start_script is not tested
var dev_script = `npx tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css --watch & vite --host --strictPort --port ${frontend_port} & nodemon ./api/server.cjs`;

var s = exec(`${mode == "dev" ? dev_script : start_script}`)
s.stdout.on('data', data => console.log(data))