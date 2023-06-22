import React from "react";
import ObjectBox from "./ObjectBox";

export const ThingTimeline = ({ thing_transactions, cache_item }) => {
	return (
		<>
			<p>thing_id : {cache_item.thing_id}</p>
			<ObjectBox object={thing_transactions} />
		</>
	);
};
