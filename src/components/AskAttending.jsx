import { useContext, useState } from "react";

import { new_document } from "../../api/client";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

export function AskAttending({ ask_id }) {
	var user_id = uhc.user_id;
	var { cache } = useContext(UnifiedHandlerClientContext);
	var [selected_option_index, set_selected_option_index] = useState();

	var ask = cache.find((i) => i.thing_id === ask_id);
	async function handle_text_answer_ask() {
		var new_ask_result_id = await uhc.request_new_transaction({
			new_thing_creator: () => ({
				type: "ask_result",
				value: {
					user_id,
					result: document.getElementById("text_answer_input").value,
					ask_id,
				},
			}),
			thing_id: undefined,
		});
		var new_meta_id = await uhc.request_new_transaction({
			new_thing_creator: () => ({
				type: "meta",
				value: {
					thing_privileges: { read: "*", write: [user_id] },
					modify_thing_privileges: user_id,
					locks: [],
					thing_id: new_ask_result_id,
				},
			}),
			thing_id: undefined,
		});

		alert("done !");
	}
	async function handle_option_based_ask() {
		if (selected_option_index === undefined) {
			alert("you have to select an option");
			return;
		}
		var new_ask_result_id = await uhc.request_new_transaction({
			new_thing_creator: () => ({
				type: "ask_result",
				value: {
					user_id,
					result: selected_option_index,
					ask_id,
				},
			}),
			thing_id: undefined,
		});
		var new_meta_id = await uhc.request_new_transaction({
			new_thing_creator: () => ({
				type: "meta",
				value: {
					thing_privileges: { read: "*", write: [user_id] },
					modify_thing_privileges: user_id,
					locks: [],
					thing_id: new_ask_result_id,
				},
			}),
			thing_id: undefined,
		});

		alert("done !");
	}
	return (
		<>
			<h1>{ask.thing.value.question}</h1>
			{ask.thing.value.mode === "text_answer" && (
				<>
					<input id="text_answer_input" />
					<button onClick={handle_text_answer_ask}>submit result</button>
				</>
			)}
			{(ask.thing.value.mode === "multiple_choice" || ask.thing.value.mode === "poll") && (
				<>
					{ask.thing.value.options.map((option, index) => (
						<div onClick={() => set_selected_option_index(index)} key={index}>
							<p>
								<i
									className={
										selected_option_index === index
											? "bi-toggle-on"
											: "bi-toggle-off"
									}
								/>
								{option}
							</p>
						</div>
					))}
					<button onClick={handle_option_based_ask}>submit option selection </button>
				</>
			)}
		</>
	);
}
