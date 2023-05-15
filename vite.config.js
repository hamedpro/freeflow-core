import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs"
import os from "os";
import path from "path";
var { frontend_port, restful_api_port, websocket_api_port } = JSON.parse(
	fs.readFileSync(path.join(os.homedir(), "./.pink_rose_data/env.json"), "utf-8")
);
//console.log({ frontend_port });
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		API_ENDPOINT: JSON.stringify(restful_api_port),
		RESTFUL_API_PORT: JSON.stringify(restful_api_port),
		WEBSOCKET_API_PORT: JSON.stringify(websocket_api_port),
	},
	server: {
		port: frontend_port,
		strictPort: true,
		host: true,
	},
});
