//when user has attended an ask before and
//we just want to show the final result we
//render related component from here

import { Fragment, useContext } from "react";

import { delete_document } from "../../api/client";

export function AskResult({ ask_id }) {
	var user_id = window.localStorage.getItem("user_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);

	var ask = global_data.all.asks.find((ask) => ask._id === ask_id);
	var results_of_this_ask = global_data.all.ask_results.filter(
		(result) => result.ask_id === ask_id
	);
	if (ask === undefined) return <h1>that unit you are looking for doesnt exist ...</h1>;
	async function reset_my_answer() {
		if (confirm("are you sure") !== true) return;
		await delete_document({
			collection_name: "ask_results",
			filters: {
				user_id,
				ask_id,
			},
		});
		alert("done !");
		await get_global_data();
	}
	return (
		<>
			<h1>ask result</h1>
			<button onClick={reset_my_answer}>reset my answer </button>
			<br />
			{ask.mode === "text_answer" && (
				<>
					<h1>answers : </h1>

					{results_of_this_ask.map((result) => (
						<Fragment key={result._id}>
							<p>
								#{result.user_id} wrote : {result.result}
							</p>
							<hr />
						</Fragment>
					))}
				</>
			)}
			{ask.mode === "multiple_choice" && (
				<>
					{results_of_this_ask.find((result) => result.user_id === user_id).result ===
					ask.correct_option_index
						? "you selected the right option"
						: "you selected a wrong option "}
					<h1>options with users who have selected that : </h1>
					{ask.options.map((option, index) => (
						<div key={index}>
							<h1>
								{option} {ask.correct_option_index === index && "(correct option)"}{" "}
								:
							</h1>
							{results_of_this_ask
								.filter((result) => result.result === index)
								.map((result) => (
									<p key={result._id}>user #{result.user_id}</p>
								))}
						</div>
					))}
				</>
			)}
			{ask.mode === "poll" && (
				<>
					<h1>options with users who have selected that : </h1>
					{ask.options.map((option, index) => (
						<div key={index}>
							<h1>{option} :</h1>
							{results_of_this_ask
								.filter((result) => result.result === index)
								.map((result) => (
									<p key={result._id}>user #{result.user_id}</p>
								))}
						</div>
					))}
				</>
			)}
		</>
	);
}
