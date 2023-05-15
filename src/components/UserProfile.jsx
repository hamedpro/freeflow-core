import React, { useContext, useState } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { custom_get_collection, get_users } from "../../api/client";

import ObjectBox from "./ObjectBox";

const UserProfile = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var { user_id } = useParams();
	var [user, set_user] = useState(null);

	async function fetch_data() {
		try {
			var filtered_users = await get_users({
				filters: {
					_id: user_id,
				},
				global_data,
			});
			set_user(filtered_users[0]);
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
			<p>
				click <Link to={`/dashboard/packs`}>here</Link> to open packs of this profile
			</p>
		</div>
	);
};

export default UserProfile;
