import { useParams } from "react-router-dom";
import { Section } from "./section";
import ObjectBox from "./ObjectBox";
import { useContext } from "react";

import { CollaboratorsManagementBox } from "./CollaboratorsManagementBox";
import { MessagesBox } from "./MessagesBox";
import { AskAttending } from "./AskAttending";
import { AskResult } from "./AskResult";

export const Ask = () => {
	var { ask_id } = useParams();
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var { ask_results } = global_data.all;
	var ask = global_data.all.asks.find((ask) => ask._id === ask_id);
	if (!ask) {
		return <h1>that unit you are lookin for could not be found </h1>;
	}
	return (
		<>
			<h1>Ask #{ask_id}</h1>
			<Section title="ask data">
				<ObjectBox object={ask} />
			</Section>
			{ask_results.find((result) => result.ask_id === ask_id) === undefined ? (
				<AskAttending ask_id={ask_id} />
			) : (
				<AskResult ask_id={ask_id} />
			)}
			<CollaboratorsManagementBox context={"asks"} id={ask_id} />
			<MessagesBox />
		</>
	);
};
