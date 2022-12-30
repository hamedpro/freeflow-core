import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get_users, new_workflow } from "../../api/client";
import Select from "react-select";
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
				collaborators: selected_collaborators.map((i) => {
					return { access_level: 1, user_id: i.value };
				}),
			});
			alert(`all done!. navigating to newly created workflow's page...`);
			nav(`/users/${user_id}/workspaces/${workspace_id}/workflows/${id_of_new_workflow}`);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	var [all_users, set_all_users] = useState(null);
	async function get_data() {
		set_all_users(await get_users({ filters: {} }));
	}
	useEffect(() => {
		get_data();
	}, []);
	var [selected_collaborators, set_selected_collaborators] = useState([]);
	if (all_users === null) return <h1>loading users list... </h1>;
	return (
		<div className="p-2">
			<h2>NewWorkflow</h2>
			<h1>creator's user_id : {user_id}</h1>
			<h1>workspace_id : {workspace_id}</h1>
			<h1>enter title : </h1> <input id="title" />
			<h1>enter description :</h1> <input id="description" />
			<h1>choose collaborators of this new workspace :</h1>
			<Select
				onChange={set_selected_collaborators}
				value={selected_collaborators}
				options={[
					...all_users.map((user) => {
						return {
							value: user._id,
							label: `@${user.username}`,
						};
					}),
				]}
				isMulti
				isSearchable
			/>
			<button onClick={submit_new_workflow}> submit new workflow</button>
		</div>
	);
};

export default NewWorkflow;
