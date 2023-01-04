import React, { useContext, useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { get_collection } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import ObjectBox from "./ObjectBox";

export const Event = () => {
	var { event_id } = useParams();
	var [event, set_event] = useState(null);
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	async function get_data() {
		var event = (
			await get_collection({
				collection_name: "events",
				filters: {
					_id: event_id,
				},
				global_data,
			})
		)[0];
		set_event(event);
	}
	useEffect(() => {
		get_data();
	}, []);
	if (event === null) return <h1>still loading user event...</h1>;
	return (
		<>
			<h1>Event</h1>
			<ObjectBox object={event} />
		</>
	);
};
