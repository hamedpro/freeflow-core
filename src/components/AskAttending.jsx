//when we want to show an ask to a
//user and enable him/her to attend that we render
//its related component from here

import { useContext, useState } from "react";

import { new_document } from "../../api/client";

export function AskAttending({ ask_id }) {
	var user_id = window.localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var [selected_option_index, set_selected_option_index] = useState();

	var ask = global_data.all.asks.find((ask) => ask._id === ask_id);
	if (ask === undefined) return <h1>that unit you are looking for doesnt exist ...</h1>;

	async function handle_text_answer_ask() {
		await new_document({
			collection_name: "ask_results",
			document: {
				user_id,
				result: document.getElementById("text_answer_input").value,
				ask_id,
			},
		});
		alert("done !");
		await get_global_data();
	}
	async function handle_option_based_ask() {
		if (selected_option_index === undefined) {
			alert("you have to select an option ");
			return;
		}

		await new_document({
			collection_name: "ask_results",
			document: {
				user_id,
				result: selected_option_index,
				ask_id,
			},
		});
		alert("done !");
		await get_global_data();
	}
	return (
		<>
			<h1>{ask.question}</h1>
			{ask.mode === "text_answer" && (
				<>
					<input id="text_answer_input" />
					<button onClick={() => handle_ask_attending("text_answer")}>
						submit result
					</button>
				</>
			)}
			{(ask.mode === "multiple_choice" || ask.mode === "poll") && (
				<>
					{ask.options.map((option, index) => (
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
