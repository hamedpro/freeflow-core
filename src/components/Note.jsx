import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { custom_axios_download } from "../../api/client";

import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
import { Item, Menu, useContextMenu } from "react-contexify";
import { CustomEditorJs } from "./CustomEditorJs";

export const Note = ({ cache_item }) => {
	var nav = useNavigate();
	var editor_js_instance = useRef();
	var { show } = useContextMenu({
		id: "options_context_menu",
	});

	const saveHandler = async () => {
		var data = await editor_js_instance.current.save();
		try {
			await uhc.request_new_transaction({
				new_thing_creator: (prev) => ({
					...prev,
					value: { ...prev.value, data },
				}),
				thing_id: cache_item.thing_id,
			});
		} catch (error) {
			console.log(error);
			alert("something went wrong when saving the new edited note data. details in console");
		}
		alert("saved!");
	};
	async function change_note_handler(type) {
		var meta = uhc.find_thing_meta(cache_item.thing_id);
		if (!meta) {
			alert("meta was not found for this note. create it first.");
			return;
		}
		var tmp = meta.thing.value.thing_privileges.read;
		if (tmp !== "*" && !tmp.includes(uhc.user_id)) {
			alert("you have not access to do this action ");
			return;
		}
		var user_input = window.prompt(`enter new value for ${type}`);
		if (user_input === null) return;
		if (user_input === "") {
			alert("invalid value : your input was an empty string");
			return;
		}

		await uhc.request_new_transaction({
			new_thing_creator: (prev) => ({
				...prev,
				value: { ...prev.value, [type]: user_input },
			}),
			thing_id: cache_item.thing_id,
		});
		alert("done !");
	}

	async function export_unit_handler() {
		alert("feature coming soon !");
		return;
		await custom_axios_download({
			file_name: `notes-${note_id}-at-${new Date().getTime()}.tar`,
			url: new URL(
				`/v2/export_unit?unit_id=${note_id}&unit_context=notes`,
				window.api_endpoint
			),
		});
	}
	var note_locks = uhc.find_thing_meta(cache_item.thing_id).thing.value.locks;
	var note_data_lock = note_locks.find((i) => i.path[0] === "data");
	async function lock_note_data_for_me() {
		await uhc.request_new_transaction({
			new_thing_creator: (prev) => ({
				...prev,
				value: {
					...prev.value,
					locks: [...prev.value.locks, { path: ["data"], value: uhc.user_id }],
				},
			}),
			thing_id: uhc.find_thing_meta(cache_item.thing_id).thing_id,
		});
	}
	async function release_note_data_lock() {
		var new_locks = note_locks.filter((i) => i.path[0] !== "data");

		await uhc.request_new_transaction({
			new_thing_creator: (prev) => ({
				...prev,
				value: {
					...prev.value,
					locks: new_locks,
				},
			}),
			thing_id: uhc.find_thing_meta(cache_item.thing_id).thing_id,
		});
	}
	return (
		<>
			<Menu id="options_context_menu">
				<Item id="change_title" onClick={() => change_note_handler("title")}>
					Change Title
				</Item>

				<Item id="export_unit" onClick={export_unit_handler}>
					Export Unit
				</Item>
			</Menu>
			<div className="p-4">
				<div className="flex justify-between mb-1 items-center">
					<h1 className="text-lg">Note</h1>
					<button className="items-center flex" onClick={(event) => show({ event })}>
						<i className="bi-list text-lg" />{" "}
					</button>
				</div>

				{!cache_item.thing.value.data && (
					<div className="break-all flex space-x-1 bg-blue-700 text-white p-2 rounded">
						<i className="bi-info-circle-fill"></i>
						<span>
							{`there is not any note commit for this note yet. type and hit save to create the
					first note commit`}
						</span>
						<StyledDiv
							className="w-fit mt-2 text-xs break-keep flex items-center justify-center text-center"
							onClick={() => nav(`/dashboard/time_machine`)}
						>
							<i className="bi-clock-history text-lg" />
							open time machine
						</StyledDiv>
					</div>
				)}
				<h1>note title : {cache_item.thing.value.title}</h1>
				<Section title="note data lock state">
					state :{" "}
					{note_data_lock?.value
						? `is_locked_for ${note_data_lock.value}`
						: "is not locked"}
					<br />
					{!note_data_lock?.value && (
						<button onClick={lock_note_data_for_me}>lock for me(start_editing)</button>
					)}
					<br />
					{note_data_lock?.value && note_data_lock.value === uhc.user_id && (
						<button onClick={release_note_data_lock}>release lock</button>
					)}
				</Section>
				<Section title="note content" className=" relative w-full overflow-hidden">
					<CustomEditorJs
						note_id={cache_item.thing_id}
						pass_ref={(i) => (editor_js_instance.current = i)}
					/>
				</Section>

				<StyledDiv className="w-fit m-2" onClick={saveHandler}>
					save current state
				</StyledDiv>
			</div>
		</>
	);
};
