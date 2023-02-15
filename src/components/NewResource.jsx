import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { get_users, upload_new_resources } from "../../api/client";
import Select from "react-select";
import { GlobalDataContext } from "../GlobalDataContext";
export const NewResource = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var nav = useNavigate();
	var [search_params, set_search_params] = useSearchParams();

	var pack_id = search_params.get("pack_id");

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

	var user_id = localStorage.getItem("user_id");
	async function upload_files_handler() {
		if (document.getElementById("files_input").files.length === 0) {
			alert("you have not selected any file to upload.");
			return;
		}
		var collaborators = selected_collaborators.map((i) => {
			return { access_level: 1, user_id: i.value };
		});
		var description = document.getElementById("description_input").value;
		var title = document.getElementById("title_input").value;
		collaborators.push({ access_level: 3, user_id });
		try {
			var tmp = {
				input_element_id: "files_input",
				data: {
					pack_id: selected_parent_pack.value,
					collaborators,
					description,
					title,
				},
			};
			var result = await upload_new_resources(tmp);
			alert(
				`all done! ${
					result.length === 1
						? "navigating to this new uploaded resource ..."
						: "you have uploaded multiple files so you will be navigated to parent level of those new resources "
				}`
			);
			if (result.length === 1) {
				nav(`/dashboard/resources/${result[0]}`);
			} else {
				nav(pack_id !== null ? `/dashboard/packs/${pack_id}` : `/dashboard/`);
			}
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
	if (all_users === null) return <h1>loading users list... </h1>;
	return (
		<>
			<div>NewResource</div>

			<p>select files you want to upload : </p>
			<input type="file" multiple id="files_input" />
			<h1>enter a title:</h1>
			<input id="title_input" type={"text"} />
			<h1>enter a description:</h1>
			<input id="description_input" type={"text"} />

			<h1>choose collaborators of this new resource :</h1>
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
			<h1>select a parent pack if you want : </h1>
			<Select
				onChange={set_selected_parent_pack}
				value={selected_parent_pack}
				options={[
					{ value: null, label: "without a parent " },
					...global_data.user.packs.map((pack) => {
						return {
							value: pack._id,
							label: pack.title,
						};
					}),
				]}
				isSearchable
			/>
			<button onClick={upload_files_handler}>submit these</button>
		</>
	);
};
