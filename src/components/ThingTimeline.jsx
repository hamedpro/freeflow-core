import React, { useState } from "react";
import ObjectBox from "./ObjectBox";
import { TransactionsTimeline } from "./TransactionsTimeline";
import { Section } from "./section";

export const ThingTimeline = ({ thing_transactions, cache_item }) => {
	var [tr_timeline_mode, set_tr_timeline_mode] = useState("short");

	return (
		<>
			<p>thing_id : {cache_item.thing_id}</p>
			<Section title="thing timeline interpretation mode">
				{["short", "verbose"].map((mode) => (
					<div onClick={() => set_tr_timeline_mode(mode)} key={mode}>
						<i
							className={mode === tr_timeline_mode ? "bi-toggle-on" : "bi-toggle-off"}
						/>
						<span>{mode}</span>
					</div>
				))}
			</Section>
			<TransactionsTimeline transactions={thing_transactions} mode={tr_timeline_mode} />
		</>
	);
};
