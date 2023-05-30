import React, { useContext, useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { ThingTimeline } from "./ThingTimeline";
import { RawThing } from "./RawThing";
import { RawThingTimeline } from "./RawThingTimeline";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { Thing } from "./Thing";

export const Stage = () => {
	var { cache, transactions } = useContext(UnifiedHandlerClientContext);
	var { thing_id } = useParams();
	if (!thing_id || isNaN(Number(thing_id))) {
		return "invalid url parameter : <thing_id>";
	}
	var cache_item = cache.find((i) => i.thing_id === Number(thing_id));
	if (cache_item === undefined) {
		return `not found : no thing is cached with that id (${thing_id})`;
	}

	var thing_transactions = transactions.filter((i) => i.thing_id === Number(thing_id));

	return (
		<Routes>
			<Route path="" element={<Thing {...{ cache_item, thing_transactions, cache }} />} />
			<Route
				path="timeline"
				element={<ThingTimeline {...{ cache_item, thing_transactions }} />}
			/>
			<Route path="raw" element={<RawThing {...{ cache_item, thing_transactions }} />} />
			<Route
				path="raw_timeline"
				element={<RawThingTimeline {...{ cache_item, thing_transactions }} />}
			/>
		</Routes>
	);
};
