import React, { useState } from "react";
import "./App.css";
import "./output.css";
import { BrowserRouter } from "react-router-dom";
import { AppContext } from "./AppContext.js";
import App from "./App";
import { UnifiedHandlerClient } from "../api_dist/api/UnifiedHandlerClient";
import { UnifiedHandlerClientContextProvider } from "./UnifiedHandlerClientContextProvider";
export function AppContainer() {
	return (
		<UnifiedHandlerClientContextProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</UnifiedHandlerClientContextProvider>
	);
}
