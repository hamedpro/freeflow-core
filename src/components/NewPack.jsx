import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { get_users, new_pack } from "../../api/client";
import Select from "react-select";
import { GlobalDataContext } from "../GlobalDataContext";
import { StyledDiv } from "./styled_elements";
export const NewPack = () => {
	var [all_users, set_all_users] = useState(null);
	var [selected_collaborators, set_selected_collaborators] = useState([]);
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var [search_params, set_search_params] = useSearchParams();
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
	var [selected_parent_pack, set_selected_parent_pack] = useState(default_selected_parent_pack);

	var user_id = localStorage.getItem("user_id");
	var nav = useNavigate();
	async function submit_new_pack() {
		var title = document.getElementById("title").value;
		var description = document.getElementById("description").value;
		var collaborators = selected_collaborators.map((i) => {
			return { is_owner: false, user_id: i.value };
		});
		collaborators.push({ is_owner: true, user_id });
		try {
			var tmp = {
				title,
				description,
				collaborators,
				pack_id: selected_parent_pack.value,
			};
			var id_of_new_pack = await new_pack(tmp);
			alert("all done!. navigating to newly created pack's page ...");
			nav(`/dashboard/packs/${id_of_new_pack}/`);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
		get_global_data();
	}

	async function get_data() {
		set_all_users(await get_users({ filters: {}, global_data }));
	}
	useEffect(() => {
		get_data();
	}, []);
	if (all_users === null) return <h1>loading users list... </h1>;
	return (
		<div className="p-2">
			<h1>New Pack</h1>
			<h1 className="mt-2">enter title :</h1>
			<input className="border border-blue-400 rounded px-1" id={"title"} />

			<h1 className="mt-2">enter description :</h1>
			<textarea
				className="border border-blue-400 rounded px-1"
				id={"description"}
				rows={5}
			></textarea>

			<h1 className="mt-2">choose collaborators of this new pack :</h1>
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
			<h1 className="mt-2">choose a parent pack for this pack if you want:</h1>
			<Select
				onChange={set_selected_parent_pack}
				value={selected_parent_pack}
				options={[
					{ label: "without a parent", value: null },
					...global_data.user.packs.map((pack) => {
						return {
							value: pack._id,
							label: pack.title,
						};
					}),
				]}
			/>
			<StyledDiv onClick={submit_new_pack} className="w-fit mt-2">
				create pack{" "}
			</StyledDiv>
		</div>
	);
};
