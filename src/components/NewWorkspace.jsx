import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get_users, new_workspace } from "../../api/client";
import Select from "react-select"
const NewWorkspace = () => {
	var { user_id } = useParams();
	var nav = useNavigate()
	async function submit_new_workspace() {
		var title = document.getElementById("title").value;
		var description = document.getElementById("description").value;
		var collaborators = selected_collaborators.map(i=> {return {access_level : 1, user_id : i.value }})
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
	var [all_users,set_all_users] = useState(null)
	async function get_data() {
		set_all_users(await get_users({ filters: {} }))
	}
	useEffect(() => {
		get_data()
	},[])
	var [selected_collaborators,set_selected_collaborators] = useState([])
	if(all_users === null ) return <h1>loading users list... </h1>
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
			<button onClick={submit_new_workspace}>submit</button>
		</div>
	);
};

export default NewWorkspace;
