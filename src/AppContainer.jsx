import React, { useState } from "react";
import "./App.css";
import "./output.css";
import { BrowserRouter } from "react-router-dom";
import { AppContext } from "./AppContext.js";
import App from "./App";
export function AppContainer() {
	var [AppContextState, setAppContextState] = useState({});
	return (
		<AppContext.Provider value={{ AppContextState, setAppContextState }}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</AppContext.Provider>
	);
}
