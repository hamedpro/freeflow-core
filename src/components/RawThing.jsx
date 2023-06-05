import React from "react";
import { MessagesBox } from "./MessagesBox";

export const RawThing = ({ thing_transactions, cache_item }) => {
	return (
		<>
			<p>thing_id : {cache_item.thing_id}</p>
			<pre>{JSON.stringify(cache_item.value)}</pre>
			<MessagesBox thing_id={cache_item.thing_id} />
		</>
	);
};
