import React from "react";

export const ThingTimeline = ({ thing_transactions, cache_item }) => {
	return (
		<>
			<p>thing_id : {cache_item.thing_id}</p>
			<pre>{JSON.stringify(thing_transactions)}</pre>
		</>
	);
};
