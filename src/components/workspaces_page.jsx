import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get_user_workspaces } from "../../api/client";
import ObjectBox from "./ObjectBox";

export const WorkspacesPage = () => {
	var user_id = localStorage.getItem("user_id");
	var [workspaces, set_workspaces] = useState(null);
	async function get_data() {
		try {
			set_workspaces(await get_user_workspaces({ creator_user_id: user_id }));
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
									link={`/dashboard/workspaces/${workspace._id}`}
								/>
							</React.Fragment>
						);
					})}
			</div>
		</div>
	);
};
