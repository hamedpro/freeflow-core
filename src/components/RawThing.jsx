import React from "react";
import { MessagesBox } from "./MessagesBox";
import ObjectBox from "./ObjectBox";

export const RawThing = ({ thing_transactions, cache_item }) => {
	return (
		<>
			<p>thing_id : {cache_item.thing_id}</p>
			<ObjectBox object={cache_item.thing} />
			<MessagesBox thing_id={cache_item.thing_id} />
		</>
	);
};
