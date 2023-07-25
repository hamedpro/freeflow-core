import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import fs from "fs"
import os from "os"
import path from "path"
var { frontend_port, restful_api_endpoint, websocket_api_endpoint } =
    JSON.parse(
        fs.readFileSync(
            path.join(os.homedir(), "./.freeflow_data/env.json"),
            "utf-8"
        )
    )
//console.log({ frontend_port });
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    clearScreen: false,
    define: {
        RESTFUL_API_ENDPOINT: JSON.stringify(restful_api_endpoint),
        WEBSOCKET_API_ENDPOINT: JSON.stringify(websocket_api_endpoint),
    },

    server: {
        port: frontend_port,
        strictPort: true,
        host: true,
    },
})
