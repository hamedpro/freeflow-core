import React from "react";
import { useParams } from "react-router-dom";

export const Resource = () => {
	var { resource_id } = useParams();
	return <div>Resource</div>;
};
