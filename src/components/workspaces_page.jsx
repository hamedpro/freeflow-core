import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get_workspaces } from "../../api/client";
import ObjectBox from "./ObjectBox";

export const WorkspacesPage = () => {
	var nav = useNavigate();
	var { username } = useParams();
	var [workspaces, set_workspaces] = useState(null);
	async function get_data() {
		try {
			set_workspaces(await get_workspaces({ username }));
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	useEffect(() => {
		get_data();
	}, []);
	return (
		<div>
			<h1>WorkspacesPage</h1>
			<div>
				{workspaces !== null &&
					workspaces.map((workspace, index) => {
						return (
							<React.Fragment key={index}>
								<ObjectBox
									object={workspace}
									link={`/users/${username}/workspaces/${workspace._id}`}
								/>
							</React.Fragment>
						);
					})}
			</div>
		</div>
	);
};
