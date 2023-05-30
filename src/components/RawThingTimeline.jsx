import React from "react";

export const RawThingTimeline = ({ thing_transactions, cache_item }) => {
	return (
		<>
			<p>thing_id : {cache_item.thing_id}</p>
			{thing_transactions.map((tr) => (
				<pre key={tr.id}>{JSON.stringify(tr)}</pre>
			))}
		</>
	);
};
