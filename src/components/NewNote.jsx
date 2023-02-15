import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { get_users, new_note } from "../../api/client";
import Select from "react-select";
import { GlobalDataContext } from "../GlobalDataContext";
export const NewNote = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var nav = useNavigate();
	var [search_params, set_search_params] = useSearchParams();

	var user_id = localStorage.getItem("user_id");
	async function submit_new_note() {
		var collaborators = selected_collaborators.map((i) => {
			return { access_level: 1, user_id: i.value };
		});
		collaborators.push({ access_level: 3, user_id });
		try {
			var tmp = {
				title: document.getElementById("title").value,
				collaborators,
				pack_id: selected_parent_pack.value,
			};
			var id_of_new_note = await new_note(tmp);
			alert("all done. navigating to newly created note's page");
			nav(`/dashboard/notes/${id_of_new_note}`);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	var [all_users, set_all_users] = useState(null);
	async function get_data() {
		set_all_users(await get_users({ filters: {}, global_data }));
	}
	useEffect(() => {
		get_data();
	}, []);
	var [selected_collaborators, set_selected_collaborators] = useState([]);

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

	if (all_users === null) return <h1>loading users list... </h1>;

	return (
		<div>
			<h1>NewNote</h1>

			<h1>enter a title : </h1>
			<input id="title" className="border border-blue-400" />
			<h1>choose collaborators of this new note :</h1>
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
			<h1>select a parent pack for this note if you want :</h1>
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
			<button onClick={submit_new_note}>submit this note</button>
		</div>
	);
};
