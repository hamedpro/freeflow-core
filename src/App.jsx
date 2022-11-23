import React from "react";
import "./App.css";
import "./output.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { customAjax } from "../src/custom_ajax.js";
//import {} from "./components";
import { multi_lang_helper as ml } from "./common";
import { Login } from "./components/Login";
import { RegisterPage } from "./components/register_page";
import { WorkspacePage } from "./components/workspace_page";
import { WorkspacesPage } from "./components/workspaces_page";
import { Calendar } from "./components/Calendar";
import { SubscribtionPage } from "./components/subscribtionPage";
import { Root } from "./components/Root";
import Notes from "./Notes";
import UserProfile from "./UserProfile";
import NewWorkspace from "./components/NewWorkspace";
import NewWorkflow from "./components/NewWorkflow";
import { Note } from "./components/Note";
import { Task } from "./components/Task";
import Workflow from "./components/Workflow";
import { NewNote } from "./components/NewNote";
import { NewTask } from "./components/NewTask";
import { Terms } from "./components/Terms";
import { RegisterCompleteUserInfo } from "./components/RegisterCompleteUserInfo";
import { VerifyIdentity } from "./components/VerifyIdentity";
function App() {
	window.ml = ml;
	window.customAjax = customAjax;
	window.api_endpoint = API_ENDPOINT; // it gets replaced by vite
	var nav = useNavigate();

	return (
		<Routes>
			<Route path="/" element={<Root />} />
			<Route path="login" element={<Login />} />
			<Route path="register">
				<Route path="" element={<RegisterPage /> } /> 
				<Route path="complete_user_registering" element={<RegisterCompleteUserInfo />  } />
			</Route>
			<Route path="verification" element={<VerifyIdentity /> } /> 
			<Route path="/terms" element={<Terms />} />
			<Route path="users/:username">
				<Route path='' element={<UserProfile />} />
				<Route path="workspaces" element={<WorkspacesPage />} />
				<Route path="workspaces/new" element={<NewWorkspace />} />
				<Route path="workspaces/:workspace_id" element={<WorkspacePage />} />
				<Route path="workspaces/:workspace_id/workflows/new" element={<NewWorkflow />} />
				<Route path="workspaces/:workspace_id/workflows/:workflow_id" element={<Workflow />} />
				<Route path="workspaces/:workspace_id/workflows/:workflow_id/new" element={<Notes />} />
				<Route path="workspaces/:workspace_id/workflows/:workflow_id/notes/:note_id" element={<Note />} />
				<Route path="workspaces/:workspace_id/workflows/:workflow_id/notes/new" element={<NewNote />} />
				<Route path="workspaces/:workspace_id/workflows/:workflow_id/tasks/:task_id" element={<Task />} />
				<Route path="workspaces/:workspace_id/workflows/:workflow_id/tasks/new" element={<NewTask />} />
				<Route path="calendar" element={<Calendar />} /> 
			</Route>
			<Route path="subscribtion" element={<SubscribtionPage /> } />
		</Routes>
	);
}

export default App;
