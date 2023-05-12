import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs"
var { frontend_port, restful_api_port, websocket_api_port } = JSON.parse(
	fs.readFileSync("./env.json", "utf-8")
);
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
