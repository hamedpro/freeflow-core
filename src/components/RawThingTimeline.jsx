import React from "react";
import ObjectBox from "./ObjectBox";
import { TransactionsTimeline } from "./TransactionsTimeline";

export const RawThingTimeline = ({ thing_transactions, cache_item, cache, transactions }) => {
	var transactions_to_show = [
		...thing_transactions,
		...cache
			.filter(
				(i) =>
					i.thing.type === "message" &&
					uhc.find_thing_meta(i.thing_id) !== undefined &&
					uhc.find_thing_meta(i.thing_id).thing.value.points_to === cache_item.thing_id
			)
			.map((message) => transactions.filter((tr) => tr.thing_id === message.thing_id))
			.flat(),
	];
	transactions_to_show.sort((tr1, tr2) => tr1.time - tr2.time);

	return (
		<>
			<p>thing_id : {cache_item.thing_id}</p>

			<TransactionsTimeline transactions={transactions_to_show} mode="raw" />
		</>
	);
};
