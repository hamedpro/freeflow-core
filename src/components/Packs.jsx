import React, { useState } from "react";
import { useContext } from "react";

import ObjectBox from "../components/ObjectBox";
export const Packs = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	return (
		<>
			<h1>packs (these are packs which this user is a collaborator of)</h1>
			{global_data.user.packs.map((pack) => (
				<ObjectBox object={pack} key={pack._id} link={`/dashboard/packs/${pack._id}`} />
			))}
		</>
	);
};
