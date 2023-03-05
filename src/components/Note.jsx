import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Attach from "@editorjs/attaches";
import Table from "@editorjs/table";
import ImageTool from "@editorjs/image";
import Checklist from "@editorjs/checklist";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { custom_delete, leave_here, new_document, update_document } from "../../api/client";
import ObjectBox from "./ObjectBox";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import { GlobalDataContext } from "../GlobalDataContext";
import { Section } from "./section";
import { StyledDiv } from "./styled_elements";
import { MessagesBox } from "./MessagesBox";
export const Note = () => {
	var nav = useNavigate();
	var [search_params, set_search_params] = useSearchParams();
	var { note_id } = useParams();
	var user_id = localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var editor_js_instance = useRef();
	var note = global_data.all.notes.find((note) => note._id === note_id);
	const saveHandler = async () => {
		editor_js_instance.current.save().then(async (output_data) => {
			try {
				await new_document({
					collection_name: "note_commits",
					document: {
						user_id,
						note_id,
						data: output_data,
						time: new Date().getTime(),
					},
				});
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
		if (note.collaborators.find((i) => i.user_id === user_id).is_owner === true) {
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
		/* if (note.collaborators.find((i) => i.user_id === user_id).is_owner === false) {
			alert("access denied! only owner of this note can do this.");
			return;
		} */
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
	useEffect(() => {
		if (
			note !== undefined &&
			/* note.collaborators
				.map((i) => i.user_id)
				.includes(window.localStorage.getItem("user_id")) && */
			editor_js_instance.current === undefined
		) {
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
				logLevel: "ERROR",
				onReady: () => {
					//console.log("editor js initializing is done.");
					//todo show this console.log like a notification or ... to user
				},
				defaultBlock: "header",
				autofocus: true,
				placeholder: "start typing your note here...",
			};

			var last_note_commit = global_data.all.note_commits
				.filter((i) => i.note_id === note_id)
				.sort((i1, i2) => i1.time - i2.time)
				.at(-1);

			if (search_params.get("note_commit_id")) {
				editor_js_configs["data"] = global_data.all.note_commits.find(
					(i) => i._id === search_params.get("note_commit_id")
				).data;
			} else if (last_note_commit !== undefined) {
				editor_js_configs["data"] = last_note_commit.data;
			}
			var tmp = new EditorJS(editor_js_configs);
			editor_js_instance.current = tmp;
			/* todo correct this error : 
			editor.js:2 addRange(): The given range isn't in document.
			steps to reproduce :
				open a note and wait a second 
				click "open note commits" button and wait 
				click browser back button and go back
				it shows up there
			*/
		}
	}, []);
	useEffect(() => {
		return () => {
			//todo before component unmount call .destroy method of editor_js_instance
		};
	}, []);
	if (note === undefined) return <h1>that note you are looking for was not found ...</h1>;
	/* if (
		!note.collaborators.map((i) => i.user_id).includes(window.localStorage.getItem("user_id"))
	) {
		return <h1>access denied you are not a collaborator of this note</h1>;
	} */
	return (
		<div className="p-2">
			<h1 className="text-lg">Note</h1>
			<h1>
				selected note_commit :{" "}
				{search_params.get("note_commit_id")
					? `not showing current state of this note : showing a note_commit ${search_params.get(
							"note_commit_id"
					  )}`
					: "showing current state of this note"}
			</h1>
			<StyledDiv
				className="w-fit mt-2"
				onClick={() => nav(`/dashboard/notes/${note_id}/commits`)}
			>
				open commits history of this note
			</StyledDiv>
			<Section title="options">
				<div className="flex flex-col space-y-2 items-start">
					<StyledDiv onClick={() => change_note_handler("title")}>
						change title of this note
					</StyledDiv>
					<StyledDiv onClick={leave_this_note}>leave this note </StyledDiv>
					<StyledDiv onClick={delete_this_note}>delete this note</StyledDiv>
				</div>
			</Section>
			<h1>note_data : </h1>
			<ObjectBox object={note} />
			<CollaboratorsManagementBox context="notes" id={note_id} />
			<Section title="note content" className=" relative w-full overflow-hidden">
				<div id="editor-js-div"></div>
			</Section>

			<StyledDiv className="w-fit m-2" onClick={saveHandler}>
				save current state
			</StyledDiv>
			<MessagesBox />
		</div>
	);
};
