import React, { useEffect, useState } from "react";
import { useMatch, useParams } from "react-router-dom";
import { get_users, upload_new_resources } from "../../api/client";
import Select from "react-select";
export const NewResource = () => {
	var { workspace_id, user_id, workflow_id } = useParams();
	function upload_files_handler() {
		var collaborators = selected_collaborators.map((i) => {
			return { access_level: 1, user_id: i.value };
		});
		upload_new_resources({
			input_element_id: "files_input",
			data: {
				user_id,
				workspace_id,
				workflow_id,
				collaborators,
			},
		});
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
		<>
			<div>NewResource</div>
			<p>upload files to : </p>
			<input type="file" multiple id="files_input" />
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
			<button onClick={upload_files_handler}>submit these</button>
		</>
	);
};
