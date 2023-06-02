import React from "react";
import "./App.css";
import "./output.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { multi_lang_helper as ml } from "../common_helpers.js";
import { SubscribtionPage } from "./components/subscribtionPage";
import { Terms } from "./components/Terms";
import { Root } from "./components/Root.jsx";
import UserProfile from "./components/UserProfile";
import { Register } from "./components/Register";
import "react-contexify/ReactContexify.css";
import { Dashboard } from "./Dashboard";
import { UnifiedHandlerClientContextProvider } from "./UnifiedHandlerClientContextProvider";
import { Login } from "./components/Login";

function App() {
	window.ml = ml;

	return (
		<UnifiedHandlerClientContextProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Root />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/terms" element={<Terms />} />
					<Route path="/subscribtion" element={<SubscribtionPage />} />

					<Route path="/users/:user_id" element={<UserProfile />} />
					<Route path="/dashboard/*" element={<Dashboard />}></Route>
				</Routes>
			</BrowserRouter>
		</UnifiedHandlerClientContextProvider>
	);
}

export default App;
