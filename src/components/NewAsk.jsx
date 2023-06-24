import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";

import { StyledDiv } from "./styled_elements";
import { Section } from "./section";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { PrivilegesEditor } from "./PrivilegesEditor";
import { CreateMore } from "./CreateMore";
export const NewAsk = () => {
	var [create_more, set_create_more] = useState();

	var nav = useNavigate();
	var { cache } = useContext(UnifiedHandlerClientContext);
	var [selected_mode, set_selected_mode] = useState("poll"); //possible modes : "poll" , "multiple_choice" , "text_answer"

	var [current_mode_options, set_current_mode_options] = useState([]);
	//if selected_mode is poll or multiple_choice
	//it holds those its options

	var [multiple_choice_correct_option_index, set_multiple_choice_correct_option_index] =
		useState();

	var [privileges, set_privileges] = useState();

	var [search_params, set_search_params] = useSearchParams();

	var user_id = uhc.user_id;

	async function submit_new_ask() {
		//early terminatios :
		if (
			selected_mode === "multiple_choice" &&
			multiple_choice_correct_option_index === undefined
		) {
			alert('in "multiple choice" mode you must select correct option');
			return;
		}

		try {
			var tmp = {
				question: document.getElementById("question").value,
			};

			//appending options
			if (selected_mode === "poll") {
				tmp.options = current_mode_options;
			} else if (selected_mode === "multiple_choice") {
				tmp.options = current_mode_options;
				tmp.correct_option_index = multiple_choice_correct_option_index;
			}

			//assiging mode :
			tmp.mode = selected_mode;
			/* console.log(tmp, privileges);
			return; */
			var new_ask_id = await uhc.request_new_transaction({
				new_thing_creator: () => ({
					type: "unit/ask",
					value: tmp,
				}),
				thing_id: undefined,
			});
			var meta_id = await uhc.request_new_transaction({
				new_thing_creator: () => ({
					type: "meta",
					value: {
						thing_privileges: privileges,
						modify_thing_privileges: uhc.user_id,
						locks: [],
						pack_id: selected_parent_pack.value,
						thing_id: new_ask_id,
					},
				}),
			});
			alert("all done!");
			if (!create_more) {
				nav(`/dashboard/${new_ask_id}`);
			}
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}

	var [selected_parent_pack, set_selected_parent_pack] = useState(() => {
		var pack_id = Number(search_params.get("pack_id"));
		if (pack_id) {
			let tmp = cache.find((i) => i.thing_id === pack_id);
			return {
				value: tmp.thing_id,
				label: tmp.thing.value.type,
			};
		} else {
			return { value: null, label: "without a parent pack" };
		}
	});
	function add_new_option() {
		set_current_mode_options((prev) => [...prev, window.prompt("enter new option")]);
	}

	return (
		<div className="p-2">
			<h1>NewAsk</h1>

			<h1 className="mt-2">enter a question : </h1>
			<input id="question" className="border border-blue-400 px-1 rounded" />
			<PrivilegesEditor onChange={set_privileges} />
			<p>select mode of this ask : </p>
			{["multiple_choice", "poll", "text_answer"].map((mode) => (
				<div onClick={() => set_selected_mode(mode)} key={mode}>
					<i className={selected_mode === mode ? "bi-toggle-on" : "bi-toggle-off"} />{" "}
					<span>{mode}</span>
				</div>
			))}
			{selected_mode !== "text_answer" && (
				<Section title="content">
					{(selected_mode === "poll" || selected_mode === "multiple_choice") && (
						<>
							<button onClick={add_new_option}>add a new option</button>
							<table>
								<thead>
									<tr>
										<th>option index</th>
										<th>option text</th>
										{selected_mode === "multiple_choice" && (
											<th>is correct option</th>
										)}
									</tr>
								</thead>
								<tbody>
									{current_mode_options.map((option, index) => (
										<tr key={Math.round(Math.random() * 1000)}>
											<td>{index}</td>
											<td>{option}</td>
											{selected_mode === "multiple_choice" && (
												<td>
													{index === multiple_choice_correct_option_index
														? "true"
														: "false"}
												</td>
											)}
										</tr>
									))}
								</tbody>
							</table>
						</>
					)}
					{selected_mode === "multiple_choice" && (
						<button
							onClick={() =>
								set_multiple_choice_correct_option_index(
									Number(prompt("enter index of correct option"))
								)
							}
						>
							set correct option
						</button>
					)}
				</Section>
			)}
			<h1 className="mt-2">select a parent pack for this ask if you want :</h1>
			<Select
				onChange={set_selected_parent_pack}
				value={selected_parent_pack}
				options={[
					{ value: null, label: "without a parent pack " },
					...cache
						.filter((i) => i.thing.type === "unit/pack")
						.map((cache_item) => {
							return {
								value: cache_item.thing_id,
								label: cache_item.thing.value.title,
							};
						}),
				]}
				isSearchable
			/>
			<StyledDiv onClick={submit_new_ask} className="w-fit mt-2">
				submit this unit
			</StyledDiv>
			<CreateMore
				onchange={(new_state) => {
					set_create_more(new_state);
				}}
			/>
		</div>
	);
};
