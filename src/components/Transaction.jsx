import React, { useContext } from "react";
import { Section } from "./section";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { interpret_transaction } from "../../api_dist/api/utils";
import { JsonViewer } from "@textea/json-viewer";
function TransactionContent({ tr, mode }) {
	var interpreted_transaction = interpret_transaction(tr);

	if (mode === "raw") {
		return <JsonViewer value={tr} />;
	}
	var t = interpreted_transaction.type;
	if (t === "unknown") {
		return <p>this transaction didn't match any known interpretation pattern.</p>;
	}
}
export const Transaction = ({ transaction_id, mode /* raw | short | verbose */ }) => {
	var { transactions } = useContext(UnifiedHandlerClientContext);
	var tr = transactions.find((tr) => tr.id === transaction_id);

	return (
		<Section>
			{tr ? (
				<TransactionContent tr={tr} mode={mode} />
			) : (
				"requested transaction could not be found to be interpret."
			)}
		</Section>
	);
};
