//when user has attended an ask before and
//we just want to show the final result we
//render related component from here

import { Fragment, useContext } from "react";

import { delete_document } from "../../api/client";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

export function AskResult({ ask_id }) {
	var user_id = uhc.user_id;
	var { cache } = useContext(UnifiedHandlerClientContext);

	async function reset_my_answer() {
		alert("feature coming soon!");
		return;
		if (confirm("are you sure") !== true) return;

		alert("done !");
	}
	var results_of_this_ask = cache.filter(
		(i) => i.thing.type === "ask_result" && i.thing.value.ask_id === ask_id
	);
	var ask = cache.find((i) => i.thing_id === ask_id);
	return (
		<>
			<h1>ask result</h1>
			<button onClick={reset_my_answer}>reset my answer </button>
			<br />
			{ask.thing.value.mode === "text_answer" && (
				<>
					<h1>answers : </h1>

					{results_of_this_ask.map((i) => (
						<Fragment key={i.thing_id}>
							<p>
								#{i.thing.value.user_id} wrote : {i.thing.value.result}
							</p>
							<hr />
						</Fragment>
					))}
				</>
			)}
			{ask.thing.value.mode === "multiple_choice" && (
				<>
					{results_of_this_ask.find((i) => i.thing.value.user_id === user_id).thing.value
						.result === ask.thing.value.correct_option_index
						? "you selected the right option"
						: "you selected a wrong option "}
					<h1>options with users who have selected that : </h1>
					{ask.thing.value.options.map((option, index) => (
						<div key={index}>
							<h1>
								{option}{" "}
								{ask.thing.value.correct_option_index === index &&
									"(correct option)"}{" "}
								:
							</h1>
							{results_of_this_ask
								.filter((i) => i.thing.value.result === index)
								.map((i) => (
									<p key={i.thing_id}>user #{i.thing.value.user_id}</p>
								))}
						</div>
					))}
				</>
			)}
			{ask.thing.value.mode === "poll" && (
				<>
					<h1>options with users who have selected that : </h1>
					{ask.thing.value.options.map((option, index) => (
						<div key={index}>
							<h1>{option} :</h1>
							{results_of_this_ask
								.filter((i) => i.thing.value.result === index)
								.map((i) => (
									<p key={i.thing_id}>user #{i.thing.value.user_id}</p>
								))}
						</div>
					))}
				</>
			)}
		</>
	);
}
