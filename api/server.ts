import fs from "fs";
import { fileURLToPath } from "url";
import { UnifiedHandlerServer } from "./UnifiedHandlerServer.js";

var {
	restful_api_port,
	websocket_api_port,
	websocket_api_endpoint,
	restful_api_endpoint,
	jwt_secret,
	frontend_port,
	frontend_endpoint,
} = JSON.parse(fs.readFileSync("./env.json", "utf-8"));

new UnifiedHandlerServer(websocket_api_port, restful_api_port, jwt_secret, frontend_endpoint);
