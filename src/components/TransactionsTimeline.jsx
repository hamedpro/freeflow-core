import React from "react";
import { Timeline } from "primereact/timeline";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Transaction } from "./Transaction";
export const TransactionsTimeline = ({ transactions, mode }) => {
	return (
		<Timeline
			className="w-full"
			value={transactions}
			align="left"
			opposite={(tr) => `#${tr.id}`}
			content={(tr) => <Transaction transaction_id={tr.id} mode={mode} />}
		/>
	);
};
