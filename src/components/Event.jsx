import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { GlobalDataContext } from "../GlobalDataContext";
import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import { check_being_collaborator } from "../../common_helpers";
import ObjectBox from "./ObjectBox";
import { MessagesBox } from "./MessagesBox";

export const Event = () => {
	var { event_id } = useParams();
	var [event, set_event] = useState();
	var user_id = localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var event = global_data.all.events.find((i) => i._id === event_id);
	if (event === undefined) return <h1>still loading user event...</h1>;
	/* if (!check_being_collaborator(event, user_id))
		return <h1>event was loaded but you have not access to it</h1>; */
	return (
		<div className="p-2">
			<h1>Event</h1>
			<h1>event data : </h1>
			<ObjectBox object={event} />
			<CollaboratorsManagementBox context={"events"} id={event_id} />
			<MessagesBox />
		</div>
	);
};
