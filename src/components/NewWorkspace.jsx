import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { new_workspace } from "../../api/client";

const NewWorkspace = () => {
	var { user_id } = useParams();
	var nav = useNavigate()
	async function submit_new_workspace() {
		var title = document.getElementById("title").value;
		var description = document.getElementById("description").value;
		var collaborators = document.getElementById("collaborators").value.split(","); // an array of user_ids
		try {
			var id_of_new_workspace = await new_workspace({
				creator_user_id: user_id,
				title,
				description,
				collaborators
			});
			alert("all done!. navigating to newly created workspace's page ...");
			nav(`/users/${user_id}/workspaces/${id_of_new_workspace}/`)
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	return (
		<div className="p-2">
			<h1>NewWorkspace</h1>
			<h1>user_id of the creator : {user_id}</h1>
			{["title", "description"].map((i, index) => {
				return (
					<React.Fragment key={index}>
						<h1>enter {i} :</h1>
						<input className="border border-blue-400 rounded px-1" id={i} />
					</React.Fragment>
				);
			})}
			<h1>enter user_ids of  workspace collaborators here seperated by comma:</h1>
			<input className="border border-blue-400 rounded px-1 block" id="collaborators" />
			<button onClick={submit_new_workspace}>submit</button>
		</div>
	);
};

export default NewWorkspace;
