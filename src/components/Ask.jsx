import { Section } from "./section";
import ObjectBox from "./ObjectBox";

import { AskAttending } from "./AskAttending";
import { AskResult } from "./AskResult";

export const Ask = ({ cache_item, cache }) => {
	return (
		<>
			<h1>Ask #{cache_item.thing_id}</h1>
			<Section title="ask data">
				<ObjectBox object={cache_item.thing.value} />
			</Section>
			{cache.find(
				(i) => i.thing.type === "ask_result" && i.thing.value.ask_id === cache_item.thing_id
			) === undefined ? (
				<AskAttending ask_id={cache_item.thing_id} />
			) : (
				<AskResult ask_id={cache_item.thing_id} />
			)}
		</>
	);
};
