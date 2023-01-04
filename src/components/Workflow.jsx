import React, { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { custom_get_collection, get_tasks, update_document } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import CommentsBox from "./CommentsBox";
import ObjectBox from "./ObjectBox";
import { Section } from "./section";
const Workflow = () => {
	var nav = useNavigate();
	var user_id = localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var { workflow_id } = useParams();
	var workflow = global_data.all.workflows.find((workflow) => workflow._id === workflow_id);
	if (workflow === undefined) {
		return <h1>this workflow you are looking for doesn't even exists</h1>;
	} else if (!workflow.collaborators.map((i) => i.user_id).includes(user_id)) {
		return <h1>access denied : you are not a collaborator of this workflow </h1>;
	}
	var user_id = localStorage.getItem("user_id");
	var notes_of_this_workflow = global_data.all.notes.filter(
		(note) => note.workflow_id === workflow_id
	);
	var tasks_of_this_workflow = global_data.all.tasks.filter(
		(task) => task.workflow_id === workflow_id
	);
	async function get_data() {
		try {
			var response = await custom_get_collection({ context: "notes", user_id });
			set_notes(response.filter((note) => note.workflow_id === workflow_id));
			set_tasks(await get_tasks({ filters: { workflow_id } }));
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	async function change_workflow_handler(type) {
		if (workflow.collaborators.find((i) => i.user_id === user_id).access_level === 1) {
			alert(
				"access denied! to do this you must either be the owner of this workflow or an admin of that"
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
			collection: "workflows",
			update_filter: {
				_id: workflow_id,
			},
			update_set,
		});
		alert("all done ");
		get_global_data();
	}
	async function leave_this_workflow() {
		if (workflow.collaborators.find((i) => i.user_id === user_id).access_level === 3) {
			alert(
				"you are the owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		leave_here({ user_id, context: "workflows", context_id: workflow_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_global_data);
	}
	async function delete_this_workflow() {
		if (workflow.collaborators.find((i) => i.user_id === user_id).access_level !== 3) {
			alert("access denied! only owner of this workflow can do this.");
			return;
		}
		if (!window.confirm("are you sure ?")) return;
		custom_delete({
			context: "workflows",
			id: workflow_id,
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
		get_data();
	}, []);
	return (
		<div>
			<h1>Workflow page</h1>
			<Section title="options">
				<button onClick={() => change_workflow_handler("title")}>
					change title of this workflow
				</button>
				<button onClick={() => change_workflow_handler("description")}>
					change description of this workflow{" "}
				</button>
				<button onClick={leave_this_workflow}>leave this workflow </button>
				<button onClick={delete_this_workflow}>delete this workflow</button>
			</Section>
			<CollaboratorsManagementBox context="workflows" id={workflow_id} />
			{notes !== null && (
				<>
					<h1>notes : </h1>
					{notes.map((note, index) => {
						return (
							<React.Fragment key={index}>
								<ObjectBox object={note} link={`/dashboard/notes/${note._id}`} />
							</React.Fragment>
						);
					})}
				</>
			)}
			{tasks !== null && (
				<>
					<h1>tasks : </h1>
					{tasks.map((task, index) => {
						return (
							<React.Fragment key={index}>
								<ObjectBox object={task} link={`/dashboard/tasks/${task._id}`} />
							</React.Fragment>
						);
					})}
				</>
			)}
			<CommentsBox user_id={user_id} />
		</div>
	);
};

export default Workflow;
