import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { get_user, get_workspaces } from "../api/client";
import ObjectBox from "./components/ObjectBox";

const UserProfile = () => {
	var [user, set_user] = useState(null);
	var [workspaces, set_workspaces] = useState(null);
	var { username } = useParams();
	async function fetch_data() {
		try {
			var response = await get_user({ username });
			set_user(response);

			set_workspaces(await get_workspaces({ username }));
		} catch (error) {
			console.log(error);
		}
	}
	useEffect(() => {
		fetch_data();
	}, []);
	return (
		<div className="p-2">
			<h1>UserProfile</h1>
			user data fetched by api :
			<br />
			<ObjectBox object={user} />
			{workspaces !== null &&
				workspaces.map((workspace, index) => {
					return (
						<React.Fragment key={index}>
							<h1>workspaces of this user</h1>
							
								<ObjectBox
									object={workspace}
									link={`/users/${username}/workspaces/${workspace._id}`}
								/>
							</React.Fragment>
						
					);
				})}
		</div>
	);
};

export default UserProfile;
