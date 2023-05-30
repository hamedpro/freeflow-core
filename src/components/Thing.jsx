import React from "react";
import { Pack } from "./Pack";

export const Thing = ({ thing_transactions, cache_item, cache }) => {
	if (cache_item.thing.type === "unit/pack") {
		return <Pack thing_id={cache_item.thing_id} cache={cache} />;
	}
	return "thing type is not supported!";
};
