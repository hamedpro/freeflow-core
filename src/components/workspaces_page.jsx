import React, { useContext, useEffect, useState } from "react";
import { custom_get_collection } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import ObjectBox from "./ObjectBox";

export const WorkspacesPage = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var user_id = localStorage.getItem("user_id");
	var [workspaces, set_workspaces] = useState(null);
	async function get_data() {
		try {
			set_workspaces(
				await custom_get_collection({ context: "workspaces", user_id, global_data })
			);
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
