import React, { useEffect, useState } from "react";
import "./App.css";
import "./output.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
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
