import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { new_document, new_note } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { StyledDiv } from "./styled_elements";
import { Section } from "./section";
export const NewAsk = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var [selected_mode, set_selected_mode] = useState("poll"); //possible modes : "poll" , "multiple_choice" , "text_answer"
	var all_users = global_data.all.users;

	var [current_mode_options, set_current_mode_options] = useState([]);
	//if selected_mode is poll or multiple_choice
	//it holds those its options

	var [multiple_choice_correct_option_index, set_multiple_choice_correct_option_index] =
		useState();

	var [selected_collaborators, set_selected_collaborators] = useState([]);
	var nav = useNavigate();
	var [search_params, set_search_params] = useSearchParams();

	var user_id = localStorage.getItem("user_id");

	async function submit_new_ask() {
		//early terminatios :
		if (
			selected_mode === "multiple_choice" &&
			multiple_choice_correct_option_index === undefined
		) {
			alert('in "multiple choice" mode you must select correct option');
			return;
		}

		var collaborators = selected_collaborators.map((i) => {
			return { is_owner: false, user_id: i.value };
		});
		collaborators.push({ is_owner: true, user_id });
		try {
			var tmp = {
				question: document.getElementById("question").value,
				collaborators,
				pack_id: selected_parent_pack.value,
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

			tmp.creation_time = new Date().getTime();

			var id_of_new_ask = await new_document({
				collection_name: "asks",
				document: tmp,
			});
			alert("all done. navigating to newly created asks's page");
			nav(`/dashboard/asks/${id_of_new_ask}`);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
		await get_global_data();
	}

	/* if pack_id is present in url query we set default option of parent pack select to that  */
	var pack_id = search_params.get("pack_id");
	if (pack_id) {
		let pack = global_data.all.packs.find((pack) => pack._id === pack_id);
		var default_selected_parent_pack = {
			value: pack._id,
			label: pack.title,
		};
	} else {
		var default_selected_parent_pack = { value: null, label: "without a parent pack" };
	}

	/* selected_parent_pack must always be either one of them :
	{value : string , label : pack.title} or {value : null , label : "without a parent pack"} */
	var [selected_parent_pack, set_selected_parent_pack] = useState(default_selected_parent_pack);
	function add_new_option() {
		set_current_mode_options((prev) => [...prev, window.prompt("enter new option")]);
	}
	if (all_users === null) return <h1>loading users list... </h1>;

	return (
		<div className="p-2">
			<h1>NewAsk</h1>

			<h1 className="mt-2">enter a question : </h1>
			<input id="question" className="border border-blue-400 px-1 rounded" />
			<h1 className="mt-2">add collaborators to this new ask :</h1>
			<Select
				onChange={set_selected_collaborators}
				value={selected_collaborators}
				options={[
					...all_users
						.filter((user) => user._id !== user_id)
						.map((user) => {
							return {
								value: user._id,
								label: `@${user.username}`,
							};
						}),
				]}
				isMulti
				isSearchable
			/>
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
					...global_data.user.packs.map((pack) => {
						return {
							value: pack._id,
							label: pack.title,
						};
					}),
				]}
				isSearchable
			/>
			<StyledDiv onClick={submit_new_ask} className="w-fit mt-2">
				submit this unit
			</StyledDiv>
		</div>
	);
};
