import React, { useEffect, useState } from "react";
import "./App.css";
import "./output.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { customAjax } from "../src/custom_ajax.js";
import { gen_link_to_file } from "./common";
//import {} from "./components";
import { multi_lang_helper as ml } from "./common";
import { Login } from "./components/pink_rose";
import { RegisterPage } from "./components/register_page";
import { WorkspacePage } from "./components/workspace_page";
import { WorkspacesPage } from "./components/workspaces_page";
import { WorkspaceBoard } from "./components/WorkspaceBoard";
import { Task } from "./components/Task";
import { Flow } from "./components/Flow";
import { MonthCalendar } from "./components/MonthCalendar";
import { WeekCalendar } from "./components/WeekCalendar";
import { DayCalendar } from "./components/DayCalendar";
import { SubscribtionPage } from "./components/subscribtionPage";

function App() {
	window.ml = ml;
	window.customAjax = customAjax;
	window.api_endpoint = API_ENDPOINT; // it gets replaced by vite (it will be hardcoded)
	var nav = useNavigate();

	return (
		<Routes>
			<Route path="login" element={<Login />} />
			<Route path="register" element={<RegisterPage />} />
			<Route path="users/:username">
				<Route path='' element={<h1>joke about user</h1>} />
				<Route path="workspaces" element={<WorkspacesPage />} />
				<Route path="workspaces/:workspace_id" element={<WorkspacePage />} />
				<Route path="workspaces/:workspace_id/:board_id" element={<WorkspaceBoard />} />
				<Route path="workspaces/:workspace_id/:board_id/:flow_id" element={<Flow />} />
				<Route path="workspaces/:workspace_id/:board_id/:flow_id/:task_id" element={<Task />} />
				
				
				<Route path="month_calendar" element={<MonthCalendar />} />
				<Route path="week_calendar" element={<WeekCalendar />} />
				<Route path="day_calendar" element={<DayCalendar />} />
			</Route>
			<Route path="subscribtion" element={<SubscribtionPage /> } />
		</Routes>
	);
}

export default App;
