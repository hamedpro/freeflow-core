import React, { useState } from "react";
import "./App.css";
import "./output.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { month_names, multi_lang_helper as ml } from "../common_helpers.js";
import { SubscribtionPage } from "./components/subscribtionPage";
import { Note } from "./components/Note";
import { Task } from "./components/Task";
import { NewNote } from "./components/NewNote";
import { NewTask } from "./components/NewTask";
import { Terms } from "./components/Terms";
import { MonthCalendar } from "./components/MonthCalendar.jsx";
import { DayCalendar } from "./components/DayCalendar";
import { Root } from "./components/Root.jsx";
import { PrimarySideBar } from "./components/PrimarySideBar";
import { NewResource } from "./components/NewResource";
import UserProfile from "./components/UserProfile";
import { UserSettings } from "./components/UserSettings";
import { NewEvent } from "./components/NewEvent";
import { Events } from "./components/Events";
import { Event } from "./components/Event";
import { Resource } from "./components/Resource";
import { useEffect } from "react";
import { custom_get_collection, get_collection, new_user } from "../api/client";
import { GlobalDataContext } from "./GlobalDataContext";
import { NoteCommits } from "./components/NoteCommits";
import { Packs } from "./components/Packs";
import { Pack } from "./components/Pack";
import { NewPack } from "./components/NewPack";
import { RegisterStep1 } from "./components/RegisterStep1";
import { RegisterStep2 } from "./components/RegisterStep2";
import { LoginFindUser } from "./components/LoginFindUser";
import { LoginMethodChoosing } from "./components/LoginMethodChoosing";
import { LoginPasswordBased } from "./components/LoginPasswordBased";
import { LoginVerificationBased } from "./components/LoginVerificationBased";
import { RegisterStep3 } from "./components/RegisterStep3";
import "react-contexify/ReactContexify.css";
import { Asks } from "./components/Asks";
import { NewAsk } from "./components/NewAsk";
import { Ask } from "./components/Ask";
import { io } from "socket.io-client";
function TopBar() {
	var user_id = localStorage.getItem("user_id");
	return (
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
	);
}
function Wrapper({ last_location_change_timestamp }) {
	return (
		<div className="h-full w-full border-black-900 flex-col overflow-hidden">
			<TopBar />
			<div className="w-full flex" style={{ height: "92%" }}>
				<div className=" bg-blue-600 overflow-y-auto h-full" style={{ width: "13rem" }}>
					<PrimarySideBar />
				</div>
				<div
					className=" bg-blue-400 h-full overflow-y-auto h-9/10"
					style={{ width: "calc(100% - 13rem)" }}
				>
					<Routes>
						<Route
							path="packs"
							element={<Packs key={last_location_change_timestamp} />}
						/>
						<Route
							path="packs/:pack_id"
							element={<Pack key={last_location_change_timestamp} />}
						/>

						<Route
							path="packs/new"
							element={<NewPack key={last_location_change_timestamp} />}
						/>

						<Route
							path="settings"
							element={<UserSettings key={last_location_change_timestamp} />}
						/>

						<Route
							path="resources/new"
							element={<NewResource key={last_location_change_timestamp} />}
						/>
						<Route
							path="resources/:resource_id"
							element={<Resource key={last_location_change_timestamp} />}
						/>

						<Route
							path="notes/new"
							element={<NewNote key={last_location_change_timestamp} />}
						/>
						<Route
							path="notes/:note_id"
							element={<Note key={last_location_change_timestamp} />}
						/>
						<Route
							path="notes/:note_id/commits"
							element={<NoteCommits key={last_location_change_timestamp} />}
						/>
						<Route
							path="tasks/new"
							element={<NewTask key={last_location_change_timestamp} />}
						/>
						<Route
							path="tasks/:task_id"
							element={<Task key={last_location_change_timestamp} />}
						/>
						<Route
							path="events"
							element={<Events key={last_location_change_timestamp} />}
						/>
						<Route
							path="events/new"
							element={<NewEvent key={last_location_change_timestamp} />}
						/>

						<Route
							path="events/:event_id"
							element={<Event key={last_location_change_timestamp} />}
						/>

						<Route
							path="asks"
							element={<Asks key={last_location_change_timestamp} />}
						/>
						<Route
							path="asks/new"
							element={<NewAsk key={last_location_change_timestamp} />}
						/>

						<Route
							path="asks/:ask_id"
							element={<Ask key={last_location_change_timestamp} />}
						/>

						<Route path="calendar">
							<Route
								path="month"
								element={<MonthCalendar key={last_location_change_timestamp} />}
							/>

							{/* todo : test all calendar sub routes */}
							<Route
								path="day"
								element={<DayCalendar key={last_location_change_timestamp} />}
							/>
						</Route>
					</Routes>
				</div>
			</div>
		</div>
	);
}
function App() {
	var loc = useLocation();
	window.ml = ml;
	window.api_endpoint = API_ENDPOINT; // it gets replaced by vite during build process
	var [global_data, set_global_data] = useState(null);
	var [last_location_change_timestamp, set_last_location_change_timestamp] = useState(
		new Date().getTime()
	);
	async function get_global_data() {
		var user_id = localStorage.getItem("user_id");
		var new_user_context_state = { user: {}, all: {}, discoverable_transactions: undefined };
		var tmp = ["packs", "notes", "resources", "tasks", "events", "asks"];
		for (var i = 0; i < tmp.length; i++) {
			new_user_context_state.all[tmp[i]] = await get_collection({
				collection_name: tmp[i],
				filters: {},
			});
			new_user_context_state.user[tmp[i]] =
				user_id !== null ? await custom_get_collection({ context: tmp[i], user_id }) : null;
		}
		tmp = ["calendar_categories", "messages", "note_commits", "ask_results"];
		for (var i = 0; i < tmp.length; i++) {
			new_user_context_state.user[tmp[i]] =
				user_id !== null
					? await get_collection({
							collection_name: tmp[i],
							filters: { user_id },
					  })
					: null;
			new_user_context_state.all[tmp[i]] = await get_collection({
				collection_name: tmp[i],
				filters: {},
			});
		}
		new_user_context_state.all.users = await get_collection({
			collection_name: "users",
			filters: {},
		});
		new_user_context_state.all.pack_views = await get_collection({
			collection_name: "pack_views",
			filters: {},
		});
		var socket = io("http://localhost:4000");
		socket.on('sync_transactions', (transactions) => {
			new_user_context_state.discoverable_transactions = transactions
		})
		set_global_data(new_user_context_state);
	}
	useEffect(() => {
		set_last_location_change_timestamp(new Date().getTime());
		get_global_data();
	}, [loc]);
	if (global_data === null) return <h1>loading data ...</h1>;
	return (
		<GlobalDataContext.Provider value={{ global_data, get_global_data }}>
			<Routes>
				<Route path="/" element={<Root key={last_location_change_timestamp} />} />
				<Route
					path="/login/find_user"
					element={<LoginFindUser key={last_location_change_timestamp} />}
				/>
				<Route
					path="/login/method_choosing"
					element={<LoginMethodChoosing key={last_location_change_timestamp} />}
				/>
				<Route
					path="/login/verification_based"
					element={<LoginVerificationBased key={last_location_change_timestamp} />}
				/>

				<Route
					path="/login/password_based"
					element={<LoginPasswordBased key={last_location_change_timestamp} />}
				/>
				<Route
					path="/register/step1"
					element={<RegisterStep1 key={last_location_change_timestamp} />}
				/>

				<Route
					path="/register/step2"
					element={<RegisterStep2 key={last_location_change_timestamp} />}
				/>
				<Route
					path="/register/step3"
					element={<RegisterStep3 key={last_location_change_timestamp} />}
				/>

				<Route path="/terms" element={<Terms key={last_location_change_timestamp} />} />
				<Route
					path="/subscribtion"
					element={<SubscribtionPage key={last_location_change_timestamp} />}
				/>

				<Route
					path="/users/:user_id"
					element={<UserProfile key={last_location_change_timestamp} />}
				/>
				<Route
					path="/dashboard/*"
					element={
						<Wrapper
							key={last_location_change_timestamp}
							last_location_change_timestamp={last_location_change_timestamp}
						/>
					}
				></Route>
			</Routes>
		</GlobalDataContext.Provider>
	);
}

export default App;
