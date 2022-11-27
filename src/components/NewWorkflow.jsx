import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { new_workflow } from "../../api/client";

const NewWorkflow = () => {
	var nav = useNavigate();
	var { workspace_id, user_id } = useParams();
	async function submit_new_workflow() {
		try {
			var id_of_new_workflow = await new_workflow({
				workspace_id,
				creator_user_id: user_id,
				title: document.getElementById("title").value,
				description: document.getElementById("description").value,
				collaborators: document.getElementById("collaborators").value.split(","),
			});
			alert(`all done!. navigating to newly created workflow's page...`);
			nav(`/users/${user_id}/workspaces/${workspace_id}/workflows/${id_of_new_workflow}`);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	return (
		<div className="p-2">
			<h2>NewWorkflow</h2>
			<h1>creator's user_id : {user_id}</h1>
			<h1>workspace_id : {workspace_id}</h1>
			<h1>enter title : </h1> <input id="title" />
			<h1>enter description :</h1> <input id="description" />
			<h1>enter user_ids of collaborators seperated by comma</h1>
			<input id="collaborators" className="border border-blue-400 rounded" />
			<button onClick={submit_new_workflow}> submit new workflow</button>
		</div>
	);
};

export default NewWorkflow;
