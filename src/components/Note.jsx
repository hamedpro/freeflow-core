import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Table from "@editorjs/table";
import Checklist from "@editorjs/checklist";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { custom_axios_download } from "../../api/client";

import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
import { Item, Menu, useContextMenu } from "react-contexify";
export const Note = ({ cache_item }) => {
	var nav = useNavigate();

	var editor_js_instance = useRef();

	var { show } = useContextMenu({
		id: "options_context_menu",
	});

	const saveHandler = async () => {
		editor_js_instance.current.save().then(async (output_data) => {
			try {
				await uhc.request_new_transaction({
					new_thing_creator: (prev) => ({
						...prev,
						value: { ...prev.value, data: output_data },
					}),
					thing_id: cache_item.thing_id,
				});
			} catch (error) {
				console.log(error);
				alert(
					"something went wrong when saving the new edited note data. details in console"
				);
			}
		});
		/* 
      TODO: auto save : pass onChange prop to editor_js_configs before initializing and save changes in that onChange
      and also show an indicator which whenever the data changes it shows loading until the data changes is uploaded succeessfuly
    */
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
	useEffect(() => {
		var editor_js_configs = {
			holder: "editor-js-div",
			tools: {
				header: {
					class: Header,
					inlineToolbar: true,
				},
				list: {
					class: List,
					inlineToolbar: true,
				},
				table: {
					class: Table,
					inlineToolbar: true,
				},
				checklist: {
					class: Checklist,
					inlineToolbar: true,
				},
			},
			logLevel: "ERROR",
			onReady: () => {
				//console.log("editor js initializing is done.");
				//todo show this console.log like a notification or ... to user
			},
			defaultBlock: "header",
			autofocus: true,
			...(cache_item.thing.value.data ? { data: cache_item.thing.value.data } : {}),
		};

		editor_js_instance.current = new EditorJS(editor_js_configs);
		/* todo correct this error : 
			editor.js:2 addRange(): The given range isn't in document.
			steps to reproduce :
				open a note and wait a second 
				click "open note commits" button and wait 
				click browser back button and go back
				it shows up there
			*/
	}, []);
	useEffect(() => {
		return () => {
			//todo before component unmount call .destroy method of editor_js_instance
		};
	}, []);

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

				<Section title="note content" className=" relative w-full overflow-hidden">
					<div id="editor-js-div" className="px-4" style={{ minHeight: "200px" }}></div>
				</Section>

				<StyledDiv className="w-fit m-2" onClick={saveHandler}>
					save current state
				</StyledDiv>
			</div>
		</>
	);
};