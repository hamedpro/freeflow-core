import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs"
var { frontend_port, api_port, api_endpoint, db_name } = JSON.parse(
	fs.readFileSync("./env.json", "utf-8")
);
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		API_ENDPOINT: JSON.stringify(api_endpoint),
	},
});
