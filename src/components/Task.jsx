import React from "react";
import { custom_axios_download } from "../../api/client";

import { Item, Menu, useContextMenu } from "react-contexify";
export const Task = ({ cache_item }) => {
	var { show } = useContextMenu({
		id: "options_context_menu",
	});

	async function change_task_handler(type) {
		var user_input = window.prompt(`enter new value for ${type}`);
		if (user_input === null) return;
		if (user_input === "") {
			alert("invalid value : your input was an empty string");
			return;
		}

		await uhc.request_new_transaction({
			new_thing_creator: (prev) => ({
				...prev,
				value: { ...prev, [type]: user_input },
			}),
			thing_id: cache_item.thing_id,
		});
		alert("all done ");
	}

	async function export_unit_handler() {
		alert("feature coming soon !");
		return;
		await custom_axios_download({
			file_name: `tasks-${task_id}-at-${new Date().getTime()}.tar`,
			url: new URL(
				`/v2/export_unit?unit_id=${task_id}&unit_context=tasks`,
				window.api_endpoint
			),
		});
	}
	return (
		<>
			<Menu id="options_context_menu">
				<Item id="change_title" onClick={() => change_task_handler("title")}>
					Change Title
				</Item>
				<Item id="change_description" onClick={() => change_task_handler("description")}>
					Change Description
				</Item>

				<Item id="export_unit" onClick={export_unit_handler}>
					Export Unit
				</Item>
			</Menu>
			<div className="p-4">
				<div className="flex justify-between mb-1 items-center">
					<h1 className="text-lg">Task</h1>
					<button className="items-center flex" onClick={(event) => show({ event })}>
						<i className="bi-list text-lg" />{" "}
					</button>
				</div>
				<div className="p-1">
					<h1 className="mt-2">Task Raw Data :</h1>
					<p>end_date : {cache_item.thing.value.end_date}</p>
					<p>start_date : {cache_item.thing.value.start_date}</p>
					<p>title : {cache_item.thing.value.title}</p>
					<p>calendar_category_id : {cache_item.thing.value.category_id}</p>
					<p>description : {cache_item.thing.value.description}</p>
				</div>
			</div>
		</>
	);
};
