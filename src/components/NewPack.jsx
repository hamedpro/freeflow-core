import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { StyledDiv } from "./styled_elements";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import jwtDecode from "jwt-decode";
import { PrivilegesEditor } from "./PrivilegesEditor";
export const NewPack = () => {
	var { cache } = useContext(UnifiedHandlerClientContext);
	var [search_params] = useSearchParams();
	var [privileges, set_privileges] = useState();
	/* if pack_id is present in url query we set default option of parent pack select to that  */
	var pack_id = Number(search_params.get("pack_id"));
	if (pack_id) {
		var tmp = cache.find((i) => i.thing.type === "unit/pack" && i.thing_id === pack_id);
		var default_selected_parent_pack = {
			value: pack_id,
			label: tmp.thing.value.title,
		};
	} else {
		var default_selected_parent_pack = { value: null, label: "without a parent pack" };
	}
	var [selected_parent_pack, set_selected_parent_pack] = useState(default_selected_parent_pack);

	var { user_id } = uhc.active_profile.user_id;
	var nav = useNavigate();

	async function submit_new_pack() {
		var title = document.getElementById("title").value;
		var description = document.getElementById("description").value;
		try {
			var tmp = {
				title,
				description,
			};

			var id_of_new_pack = await window.uhc.request_new_transaction({
				new_thing_creator: (thing) => ({ value: tmp, type: "unit/pack" }),
			});
			var corrosponding_meta = await window.uhc.request_new_transaction({
				new_thing_creator: (thing) => ({
					type: "meta",
					value: {
						thing_privileges: privileges,
						locks: [],
						modify_thing_privilegs: user_id,
						thing_id: id_of_new_pack,
						pack_id: selected_parent_pack.value,
					},
				}),
			});
			alert("all done!. navigating to newly created pack's page ...");
			nav(`/dashboard/${id_of_new_pack}`);
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

			<PrivilegesEditor onChange={set_privileges} />
			<h1 className="mt-2">choose a parent pack for this pack if you want:</h1>
			<Select
				onChange={set_selected_parent_pack}
				value={selected_parent_pack}
				options={[
					{ label: "without a parent", value: null },
					...cache
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
