import React, { Fragment } from "react";
import "./App.css";
import "./output.css";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
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
import { useEffect } from "react";
import { NewResource } from "./components/NewResource";
import { Resources } from "./components/Resources";
function Wrapper() {
	return (
		<div className="h-full w-full border-black-900 flex">
			<div className="w-1/5 bg-blue-500 h-full overflow-y-auto">
				<PrimarySideBar />
			</div>
			<div className="w-4/5 bg-blue-400 h-full overflow-y-auto">
				<Routes>
					<Route path="" element={<UserDashboard timestamp={new Date().getTime()} />} />
					<Route
						path="complete_user_registering"
						element={<RegisterCompleteUserInfo timestamp={new Date().getTime()} />}
					/>
					<Route
						path="verification"
						element={<VerifyIdentity timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces"
						element={<WorkspacesPage timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/new"
						element={<NewWorkspace timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/:workspace_id"
						element={<WorkspacePage timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/new"
						element={<NewWorkflow timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id"
						element={<Workflow timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/resources/new"
						element={<NewResource timestamp={new Date().getTime()} />}
					/>

					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/resources"
						element={<Resources timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/:workspace_id/resources/new"
						element={<NewResource timestamp={new Date().getTime()} />}
					/>

					<Route
						path="workspaces/:workspace_id/resources"
						element={<Resources timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/notes/new"
						element={<NewNote timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/notes/:note_id"
						element={<Note timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/tasks/new"
						element={<NewTask timestamp={new Date().getTime()} />}
					/>
					<Route
						path="workspaces/:workspace_id/workflows/:workflow_id/tasks/:task_id"
						element={<Task timestamp={new Date().getTime()} />}
					/>
					<Route path="calendar">
						<Route
							path="year"
							element={<YearCalendar timestamp={new Date().getTime()} />}
						/>
						{/* todo : test it */}
						<Route
							path="month"
							element={<MonthCalendar timestamp={new Date().getTime()} />}
						/>
						{/* todo : test it */}
						<Route
							path="week"
							element={<WeekCalendar timestamp={new Date().getTime()} />}
						/>
						{/* todo : test it */}
						<Route
							path="day"
							element={<DayCalendar timestamp={new Date().getTime()} />}
						/>
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
	var loc = useLocation();
	return (
		<Routes>
			<Route path="/" element={<Root timestamp={new Date().getTime()} />} />
			<Route path="/login" element={<Login timestamp={new Date().getTime()} />} />
			<Route path="/register" element={<RegisterPage timestamp={new Date().getTime()} />} />
			<Route path="/terms" element={<Terms timestamp={new Date().getTime()} />} />
			<Route
				path="subscribtion"
				element={<SubscribtionPage timestamp={new Date().getTime()} />}
			/>
			<Route
				path="/users/:user_id/*"
				element={<Wrapper timestamp={new Date().getTime()} />}
			></Route>
			{/* <Route path="/admin">
				<Route path="users" element={<AdminDashboardUsersSection timestamp={new Date().getTime()} />} />
			</Route> */}{" "}
			{/* todo instead of having a seperated route for admin, 
			when loading profile of each user check if his/her account has admin previleges or not
			and its true show admin options */}
		</Routes>
	);
}

export default App;
