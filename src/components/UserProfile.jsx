import React from "react";

import ObjectBox from "./ObjectBox";

const UserProfile = ({ cache_item }) => {
	return (
		<div className="p-2">
			<h1>UserProfile</h1>
			<br />
			<ObjectBox object={cache_item} />
		</div>
	);
};

export default UserProfile;
