import React from "react";
import "./App.css";
import "./output.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Routes, Route, Link } from "react-router-dom";
import { month_names } from "../common_helpers.js";
import { Note } from "./components/Note";
import { Task } from "./components/Task";
import { NewNote } from "./components/NewNote";
import { NewTask } from "./components/NewTask";
import { MonthCalendar } from "./components/MonthCalendar.jsx";
import { DayCalendar } from "./components/DayCalendar";
import { PrimarySideBar } from "./components/PrimarySideBar";
import { NewResource } from "./components/NewResource";
import { UserSettings } from "./components/UserSettings";
import { NewEvent } from "./components/NewEvent";
import { Events } from "./components/Events";
import { Event } from "./components/Event";
import { Resource } from "./components/Resource";
import { NoteCommits } from "./components/NoteCommits";
import { Packs } from "./components/Packs";
import { Pack } from "./components/Pack";
import { NewPack } from "./components/NewPack";
import "react-contexify/ReactContexify.css";
import { Asks } from "./components/Asks";
import { NewAsk } from "./components/NewAsk";
import { Ask } from "./components/Ask";
import { Stage } from "./components/Stage";
import { NewChat } from "./components/NewChat";

export function Dashboard() {
	var user_id = localStorage.getItem("user_id");
	return (
		<div className="h-full w-full border-black-900 flex-col overflow-hidden">
			<div className="w-full h-14 bg-blue-700 overflow-y-hidden flex items-center px-3 space-x-3">
				<div className="w-1/4 flex space-x-2">
					<Link to={`/dashboard/settings`}>
						<i
							style={{ color: "white" }}
							className="text-3xl bi-person-fill-gear hover:bg-blue-900 duration-300 rounded-lg p-1"
						/>
					</Link>
					<Link to={`/users/${user_id}`}>
						<i
							style={{ color: "white" }}
							className="text-3xl bi-person-lines-fill hover:bg-blue-900 duration-300 rounded-lg p-1"
						/>
					</Link>
					<Link to={`/dashboard/`}>
						<i
							style={{ color: "white" }}
							className="bi-house-fill text-2xl hover:bg-blue-900 duration-300 rounded-lg p-1"
						/>
					</Link>
				</div>
				<div className="w-3/4 flex justify-between items-center h-full ">
					<div className="h-full text-white flex items-center space-x-3">
						<i className="bi-calendar4"></i>
						<div>
							{new Date().getFullYear()} /{" "}
							<Link to={`/dashboard/calendar/month`}>
								{month_names[new Date().getMonth()]}
							</Link>{" "}
							/ {<Link to={`/dashboard/calendar/day`}>{new Date().getDate()}</Link>}
						</div>
					</div>
					<div className="flex items-center space-x-3 h-5/6 my-2 py-2">
						<i
							style={{ color: "white" }}
							className="text-2xl bi-bell-fill hover:bg-blue-900 duration-300 rounded-lg p-1"
						/>
						<button className="px-2 rounded h-full flex justify-center items-center text-white bg-green-500">
							<span>Go Premium</span>
						</button>
					</div>
				</div>
			</div>
			<div className="w-full flex" style={{ height: "92%" }}>
				<div className=" bg-blue-600 overflow-y-auto h-full" style={{ width: "13rem" }}>
					<PrimarySideBar />
				</div>
				<div
					className=" bg-blue-400 h-full overflow-y-auto h-9/10"
					style={{ width: "calc(100% - 13rem)" }}
				>
					<Routes>
						<Route path="/:thing_id/*" element={<Stage />} />

						<Route path="packs/new" element={<NewPack />} />

						<Route path="settings" element={<UserSettings />} />

						<Route path="resources/new" element={<NewResource />} />

						<Route path="notes/new" element={<NewNote />} />

						<Route path="tasks/new" element={<NewTask />} />

						<Route path="events/new" element={<NewEvent />} />
						<Route path="chats/new" element={<NewChat />} />

						<Route path="asks/new" element={<NewAsk />} />

						<Route path="calendar">
							<Route path="month" element={<MonthCalendar />} />

							{/* todo : test all calendar sub routes */}
							<Route path="day" element={<DayCalendar />} />
						</Route>
					</Routes>
				</div>
			</div>
		</div>
	);
}
