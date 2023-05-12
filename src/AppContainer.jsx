import React, { useState } from "react";
import "./App.css";
import "./output.css";
import { BrowserRouter } from "react-router-dom";
import { AppContext } from "./AppContext.js";
import App from "./App";
import { UnifiedHandlerClient } from "../api_dist/api/UnifiedHandlerClient";
export function AppContainer() {
	var a = new UnifiedHandlerClient("http://localhost:4001", "http://localhost:4000");
	a.auth(
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2ODM5MjQ3NDd9.X8tkfYzeSRAP9shULs8NmHB9V1ICe2o14IT-LYRJjHc"
	);
	return <pre>{JSON.stringify(a.discoverable_transactions)}</pre>;

	var [AppContextState, setAppContextState] = useState({});
	return (
		<AppContext.Provider value={{ AppContextState, setAppContextState }}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</AppContext.Provider>
	);
}
