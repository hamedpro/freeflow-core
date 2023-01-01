import React, { useContext, useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	get_collection,
	get_workspace_workflows,
	leave_here,
	update_document,
} from "../../api/client.js";
import { UserContext } from "../UserContext.js";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox.jsx";
import CommentsBox from "./CommentsBox.jsx";
import ObjectBox from "./ObjectBox.jsx";
import { Section } from "./section.jsx";
export const WorkspacePage = () => {
	var nav = useNavigate();
	var use_context_result = useContext(UserContext);
	var { workspace_id } = useParams();
	var user_id = localStorage.getItem("user_id");
	var [workflows, set_workflows] = useState(null);
	var [workspace, set_workspace] = useState(null);
	async function get_data() {
		try {
			set_workflows(await get_workspace_workflows({ workspace_id }));
			set_workspace(
				(
					await get_collection({
						collection_name: "workspaces",
						filters: { _id: workspace_id },
					})
				)[0]
			);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	async function change_workspace_handler(type) {
		var tmp = window.prompt(`enter new workspace ${type}`);
		if (!tmp) {
			alert("you rejected input or your input was empty");
			return;
		}
		var update_set = {};
		update_set[type] = tmp;
		update_document({
			collection: "workspaces",
			update_filter: {
				_id: workspace_id,
			},
			update_set,
		})
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_data);
	}
	function leave_here_handler() {
		if (workspace.collaborators.find((i) => i.user_id === user_id).access_level === 3) {
			alert(
				"you are owner of here. if you want to leave here you must upgrade another collaborator to owner (instead of yourself) first"
			);
			return;
		}
		leave_here({ user_id, context: "workspaces", context_id: workspace_id })
			.then(
				() => alert("all done!"),
				(error) => {
					console.log(error);
					alert("something went wrong. error in console ");
				}
			)
			.finally(get_data);
	}
	useEffect(() => {
		get_data();
	}, []);
	if (workspace === null || workflows === null) return <h1>loading data ... </h1>;
	return (
		<div>
			<h2>WorkspacePage</h2>
			<ObjectBox object={workspace} />
			<Section title="options">
				<button onClick={() => change_workspace_handler("title")}>
					change title of this workspace
				</button>
				<br />
				<button onClick={() => change_workspace_handler("description")}>
					change description of this workspace
				</button>
				<br />
				<button onClick={() => leave_here_handler()}>leave here</button>
			</Section>
			<CollaboratorsManagementBox context="workspaces" id={workspace_id} />
			<p>workflows of this workspace :</p>
			{workflows !== null ? (
				workflows.map((workflow, index) => (
					<React.Fragment key={index}>
						<ObjectBox
							object={workflow}
							link={`/dashboard/workflows/${workflow._id}`}
						/>
					</React.Fragment>
				))
			) : (
				<p>loading data ...</p>
			)}
			<CommentsBox user_id={user_id} />
		</div>
	);
};
