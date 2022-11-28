import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { new_task } from "../../api/client";

export const NewTask = () => {
  var nav = useNavigate()
	var { user_id, workspace_id, workflow_id } = useParams();
	async function submit_new_task() {
		var val = (id) => document.getElementById(id).value;
		try {
			var id_of_new_task = await new_task({
				creator_user_id: user_id,
				workflow_id,
				end_date: Number(val("end_date")),
				start_date: Number(val("start_date")),
				deadline_date: Number(val("deadline_date")),
				linked_notes: val("linked_notes").split(","),
				workspace_id,
				parent: val("parent_task") === "" ? null : val("parent_task")
			});
      alert("all done. navigating to the newly created task's page");
      nav(`/users/${user_id}/workspaces/${workspace_id}/workflows/${workflow_id}/tasks/${id_of_new_task}`)
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	return (
		<div className="p-2">
			<h1>NewTask</h1>
			<h1>creator's user_id : {user_id} </h1>
			<h1>workspace_id : {workspace_id} </h1>
			<h1>workflow_id : {workflow_id} </h1>
			<h1>enter linked_notes seperated by comma : </h1>
			<input className="border border-blue-400" id="linked_notes" />
			<h1>
				enter id of it's parent task : (leave it empty if its the starting task in the
				pyramid )
			</h1>
			<input className="border border-blue-400" id="parent_task" />
			<h1>start_date : </h1>
			<input className="border border-blue-400" id="start_date" />

			<h1>end_date : </h1>
			<input className="border border-blue-400" id="end_date" />

			<h1>deadline_date : </h1>
			<input className="border border-blue-400" id="deadline_date" />

			<button onClick={submit_new_task} className="block">
				submit new task{" "}
			</button>
		</div>
	);
};
