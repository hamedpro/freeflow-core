import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Attach from "@editorjs/attaches";
import Table from "@editorjs/table";
import ImageTool from "@editorjs/image";
import Checklist from "@editorjs/checklist";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { custom_get_collection, update_note } from "../../api/client";
import ObjectBox from "./ObjectBox";
import CommentsBox from "./CommentsBox";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import { GlobalDataContext } from "../GlobalDataContext";
import { Section } from "./section";
export const Note = () => {
	var { note_id } = useParams();
	var user_id = localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var note = global_data.all.notes.find((note) => note._id === note_id);
	if (note === undefined) {
		return <h1>note you are looking for doesn't even exist!</h1>;
	} else if (!note.collaborators.map((i) => i.user_id).includes(user_id)) {
		return <h1>access denied! you are not a collaborator of this note</h1>;
	}
	var [editor_js_instanse, set_editor_js_instance] = useState(null);

	async function init_component() {
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
				attach: {
					class: Attach,
					inlineToolbar: true,
				},
				table: {
					class: Table,
					inlineToolbar: true,
				},
				image: {
					class: ImageTool,
					inlineToolbar: true,
				},
				checklist: {
					class: Checklist,
					inlineToolbar: true,
				},
			},
			onReady: () => {
				//console.log("editor js initializing is done.");
				//todo show this console.log like a notification or ... to user
			},
			defaultBlock: "header",
			autofocus: true,
			placeholder: "start typing you note here...",
		};
		if (note.data) {
			editor_js_configs["data"] = note.data;
		}
		set_editor_js_instance(new EditorJS(editor_js_configs));
	}
	useEffect(() => {
		init_component();
	}, []);
	const saveHandler = async () => {
		editor_js_instanse.save().then((output_data) => {
			try {
				update_note({ note_id, update_set: { data: output_data } });
				alert("all done");
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
		if (note.collaborators.find((i) => i.user_id === user_id).access_level === 1) {
			alert(
				"access denied! to do this you must either be the owner of this note or an admin of that"
			);
			return;
		}
		var user_input = window.prompt(`enter new value for ${type}`);
		if (!user_input) {
			alert("you cancelled or your input was an empty string");
			return;
		}
		var update_set = {};
		update_set[type] = user_input;

		await update_document({
			collection: "notes",
			update_filter: {
				_id: note_id,
			},
			update_set,
		});
		alert("all done ");
		get_global_data();
	}
	async function leave_this_note() {
		if (note.collaborators.find((i) => i.user_id === user_id).access_level === 3) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		leave_here({ user_id, context: "notes", context_id: note_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_global_data);
	}
	async function delete_this_note() {
		if (note.collaborators.find((i) => i.user_id === user_id).access_level !== 3) {
			alert("access denied! only owner of this note can do this.");
			return;
		}
		if (!window.confirm("are you sure ?")) return;
		custom_delete({
			context: "notes",
			id: note_id,
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
	return (
		<>
			<h1>Note</h1>
			<Section title="options">
				<button onClick={() => change_note_handler("title")}>
					change title of this note
				</button>
				<button onClick={leave_this_note}>leave this note </button>
				<button onClick={delete_this_note}>delete this note</button>
			</Section>
			<h1>note_data : </h1>
			<ObjectBox object={note} />
			<CollaboratorsManagementBox context="notes" id={note_id} />
			<div id="editor-js-div"></div>
			<button onClick={saveHandler}>save</button>
			<CommentsBox user_id={user_id} />
		</>
	);
};
