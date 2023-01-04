import React, { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { download_resource, get_resources } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import ObjectBox from "./ObjectBox";

export const Resource = () => {
	var { resource_id } = useParams();
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var resource_row = global_data.all.resources.find((i) => i._id === resource_id);
	if (resource_row === undefined) {
		return <h1>resource you are looking for doesn't even exist</h1>;
	} else if (resource_row.collaborators.map((i) => i.user_id).includes(user_id) !== true) {
		return <h1>access denied! you are not a collaborator of this resource</h1>;
	}
	return (
		<>
			<h1>resource</h1>
			<CollaboratorsManagementBox context={"resources"} id={resource_id} />
			<ObjectBox object={resource_row} />
			<button onClick={() => download_resource({ resource_id: resource_row._id })}>
				download this resource
			</button>
		</>
	);
};
