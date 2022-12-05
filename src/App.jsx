import React, { Fragment } from "react";
import "./App.css";
import "./output.css";
import { Routes, Route, useNavigate } from "react-router-dom";
//import {} from "./components";
import { multi_lang_helper as ml } from "./common";
import { Login } from "./components/Login";
import { RegisterPage } from "./components/register_page";
import { WorkspacePage } from "./components/workspace_page";
import { WorkspacesPage } from "./components/workspaces_page";
import { SubscribtionPage } from "./components/subscribtionPage";
import { UserDashboard } from "./components/UserDashboard";
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
import { YearCalendar } from "./components/YearCalendar";
import { MonthCalendar } from "./components/MonthCalendar.jsx";
import { WeekCalendar } from "./components/WeekCalendar";
import { DayCalendar } from "./components/DayCalendar";
import { AdminDashboardUsersSection } from "./components/AdminDashboardUsersSection";
import { Root } from "./components/Root.jsx";
import { PrimarySideBar } from "./components/PrimarySideBar";
function Wrapper() {
	return (
		<div className="h-full w-full border-black-900 flex">
			<div className="w-1/5 bg-blue-400 h-full">
				<PrimarySideBar />
			</div>
			<div className="w-4/5 bg-blue-400 h-full">
				<Routes>
					<Route path="" element={<UserDashboard />} />
					<Route
						path="complete_user_registering"
						element={<RegisterCompleteUserInfo />}
					/>
					<Route path="verification" element={<VerifyIdentity />} />
					<Route path="workspaces" element={<WorkspacesPage />} />
					<Route path="workspaces/new" element={<NewWorkspace />} />
					<Route path="workspaces/:workspace_id" element={<WorkspacePage />} />
					<Route
						path="workspaces/:workspace_id/workflows/new"
						element={<NewWorkflow />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id"
						element={<Workflow />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/notes/new"
						element={<NewNote />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/notes/:note_id"
						element={<Note />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/tasks/new"
						element={<NewTask />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/tasks/:task_id"
						element={<Task />}
					/>
					<Route path="calendar">
						<Route path="year" element={<YearCalendar />} />
						{/* todo : test it */}
						<Route path="month" element={<MonthCalendar />} />
						{/* todo : test it */}
						<Route path="week" element={<WeekCalendar />} />
						{/* todo : test it */}
						<Route path="day" element={<DayCalendar />} />
						{/* todo : test it */}
					</Route>
				</Routes>
			</div>
		</div>
	);
}
function App() {
	window.ml = ml;
	window.api_endpoint = API_ENDPOINT; // it gets replaced by vite

	return (
		<Routes>
			<Route path="/" element={<Root />} />
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/terms" element={<Terms />} />
			<Route path="subscribtion" element={<SubscribtionPage />} />
			<Route path="/users/:user_id/*" element={<Wrapper />}></Route>
			{/* <Route path="/admin">
				<Route path="users" element={<AdminDashboardUsersSection />} />
			</Route> */}{" "}
			{/* todo instead of having a seperated route for admin, 
			when loading profile of each user check if his/her account has admin previleges or not
			and its true show admin options */}
		</Routes>
	);
}

export default App;
