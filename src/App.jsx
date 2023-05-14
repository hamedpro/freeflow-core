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
import { RegisterStep1 } from "./components/RegisterStep1";
import { RegisterStep2 } from "./components/RegisterStep2";
import { LoginFindUser } from "./components/LoginFindUser";
import { LoginMethodChoosing } from "./components/LoginMethodChoosing";
import { LoginPasswordBased } from "./components/LoginPasswordBased";
import { LoginVerificationBased } from "./components/LoginVerificationBased";
import { RegisterStep3 } from "./components/RegisterStep3";
import "react-contexify/ReactContexify.css";
import { Dashboard } from "./Dashboard";
import { UnifiedHandlerClientContextProvider } from "./UnifiedHandlerClientContextProvider";

function App() {
	window.ml = ml;
	window.api_endpoint = API_ENDPOINT; // it gets replaced by vite during build process

	return (
		<UnifiedHandlerClientContextProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Root />} />
					<Route path="/login/find_user" element={<LoginFindUser />} />
					<Route path="/login/method_choosing" element={<LoginMethodChoosing />} />
					<Route path="/login/verification_based" element={<LoginVerificationBased />} />

					<Route path="/login/password_based" element={<LoginPasswordBased />} />
					<Route path="/register/step1" element={<RegisterStep1 />} />

					<Route path="/register/step2" element={<RegisterStep2 />} />
					<Route path="/register/step3" element={<RegisterStep3 />} />

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
