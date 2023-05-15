import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import ObjectBox from "./ObjectBox";
import { MessagesBox } from "./MessagesBox";
import { Item, Menu, useContextMenu } from "react-contexify";
import {
	custom_axios_download,
	custom_delete,
	leave_here,
	update_document,
} from "../../api/client";

export const Event = () => {
	var { event_id } = useParams();
	var [event, set_event] = useState();
	var nav = useNavigate();
	var user_id = localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var event = global_data.all.events.find((i) => i._id === event_id);
	var { show } = useContextMenu({
		id: "options_context_menu",
	});
	async function change_event_handler(type) {
		/* if (!note.collaborators.map((i) => i.user_id).includes(user_id)) {
			alert("access denied! to do this you must be a collaborator of this note ");
			return;
		} */
		var user_input = window.prompt(`enter new value for ${type}`);
		if (user_input === null) return;
		if (user_input === "") {
			alert("invalid value : your input was an empty string");
			return;
		}
		var update_set = {};
		update_set[type] = user_input;

		await update_document({
			collection: "events",
			update_filter: {
				_id: event_id,
			},
			update_set,
		});
		alert("all done ");
		get_global_data();
	}
	async function leave_this_event() {
		if (event.collaborators.find((i) => i.user_id === user_id).is_owner === true) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		leave_here({ user_id, context: "events", context_id: event_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_global_data);
	}
	async function delete_this_event() {
		/* if (note.collaborators.find((i) => i.user_id === user_id).is_owner === false) {
			alert("access denied! only owner of this note can do this.");
			return;
		} */
		if (!window.confirm("are you sure ?")) return;
		custom_delete({
			context: "events",
			id: event_id,
		})
			.then(
				(i) => {
					alert("all done");
					nav(`/dashboard`);
				},
				(error) => {
					console.log(error);
					alert("something went wrong! details in console");
				}
			)
			.finally(get_global_data);
	}
	async function export_unit_handler() {
		await custom_axios_download({
			file_name: `events-${event_id}-at-${new Date().getTime()}.tar`,
			url: new URL(
				`/v2/export_unit?unit_id=${event_id}&unit_context=events`,
				window.api_endpoint
			),
		});
	}
	if (event === undefined) return <h1>still loading user event...</h1>;
	/* if (!check_being_collaborator(event, user_id))
		return <h1>event was loaded but you have not access to it</h1>; */
	return (
		<>
			<Menu id="options_context_menu">
				<Item id="change_title" onClick={() => change_event_handler("title")}>
					Change Title
				</Item>
				<Item id="change_title" onClick={() => change_event_handler("description")}>
					Change Description
				</Item>
				<Item id="leave_here" onClick={() => leave_this_event()}>
					Leave Event
				</Item>
				<Item id="delete_here" onClick={() => delete_this_event()}>
					Delete Event
				</Item>
				<Item id="export_unit" onClick={export_unit_handler}>
					Export Unit
				</Item>
			</Menu>
			<div className="p-4">
				<div className="flex justify-between mb-1 items-center">
					<h1 className="text-lg">Event</h1>
					<button className="items-center flex" onClick={(event) => show({ event })}>
						<i className="bi-list text-lg" />{" "}
					</button>
				</div>
				<h1>event data : </h1>
				<ObjectBox object={event} />
				<CollaboratorsManagementBox context={"events"} id={event_id} />
				<MessagesBox />
			</div>
		</>
	);
};
