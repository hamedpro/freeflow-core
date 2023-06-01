import React from "react";
import { Pack } from "./Pack";
import { Note } from "./Note";
import { Resource } from "./Resource";
import { Event } from "./Event";

export const Thing = ({ thing_transactions, cache_item, cache }) => {
	switch (cache_item.thing.type) {
		case "unit/pack":
			return <Pack thing_id={cache_item.thing_id} cache={cache} />;
			break;
		case "unit/note":
			return <Note cache_item={cache_item} />;
			break;
		case "unit/resource":
			return <Resource cache_item={cache_item} />;
			break;
		case "unit/event":
			return <Event cache_item={cache_item} />;
			break;
		default:
			return "thing type is not supported!";

			break;
	}
};
