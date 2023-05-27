import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { StyledDiv } from "./styled_elements";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import jwtDecode from "jwt-decode";
export const NewPack = () => {
	var [selected_collaborators, set_selected_collaborators] = useState([]);
	var { current_surface_cache, unified_handler_client } = useContext(UnifiedHandlerClientContext);
	//console.log(current_surface_cache);
	var [search_params, set_search_params] = useSearchParams();
	/* if pack_id is present in url query we set default option of parent pack select to that  */
	var pack_id = Number(search_params.get("pack_id"));
	if (pack_id) {
		var tmp = current_surface_cache.find(
			(i) => i.thing.type === "unit/pack" && i.thing_id === pack_id
		);
		var default_selected_parent_pack = {
			value: pack_id,
			label: tmp.thing.value.title,
		};
	} else {
		var default_selected_parent_pack = { value: null, label: "without a parent pack" };
	}
	var [selected_parent_pack, set_selected_parent_pack] = useState(default_selected_parent_pack);

	var { user_id } = jwtDecode(localStorage.getItem("jwt"));
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
			var id_of_new_pack = await unified_handler_client.request_new_transaction({
				new_thing_creator: (thing) => ({ value: tmp, type: "unit/pack" }),
			});
			alert("all done!. navigating to newly created pack's page ...");
			nav(`/dashboard/packs/${id_of_new_pack}`);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}

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
					...current_surface_cache
						.map((i) => {
							return i;
						})
						.filter((i) => i.thing.type === "user")

						.filter((i) => i.thing_id !== user_id)
						.map((i) => {
							return {
								value: i.thing_id,
								label: i.thing.value.username,
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
					...current_surface_cache
						.filter((i) => i.thing.type === "unit/pack")
						.map((i) => {
							return {
								value: i.thing_id,
								label: i.thing.value.title,
							};
						}),
				]}
			/>
			<StyledDiv onClick={submit_new_pack} className="w-fit mt-2">
				create pack
			</StyledDiv>
		</div>
	);
};
