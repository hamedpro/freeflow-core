import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";

import { StyledDiv } from "./styled_elements";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { PrivilegesEditor } from "./PrivilegesEditor";
import { CreateMore } from "./CreateMore";
export const NewNote = () => {
	var [create_more, set_create_more] = useState();
	function select_parent_pack(value) {
		set_selected_parent_pack(value);
		set_search_params((prev) => {
			var t = {};
			for (var key of prev.keys()) {
				t[key] = prev.get(key);
				// todo it doesnt cover when there is
				//more than a single value with that key
			}
			return { ...t, pack_id: value.value };
		});
	}
	var [privileges, set_privileges] = useState();
	var nav = useNavigate();
	var { cache } = useContext(UnifiedHandlerClientContext);

	var [search_params, set_search_params] = useSearchParams();
	var [selected_parent_pack, set_selected_parent_pack] = useState(() => {
		var pack_id = Number(search_params.get("pack_id"));
		if (pack_id) {
			let tmp = cache.find((i) => i.thing_id === pack_id);
			return {
				value: tmp.thing_id,
				label: tmp.thing.value.title,
			};
		} else {
			return { value: null, label: "without a parent pack" };
		}
	});
	async function submit_new_note() {
		try {
			var new_note_id = await uhc.request_new_transaction({
				new_thing_creator: () => ({
					type: "unit/note",
					value: {
						title: document.getElementById("title").value,
						data: null,
					},
				}),
				thing_id: undefined,
			});
			var new_meta_id = await uhc.request_new_transaction({
				new_thing_creator: () => ({
					type: "meta",
					value: {
						thing_privileges: privileges,
						modify_thing_privileges: uhc.user_id,
						locks: [],
						thing_id: new_note_id,
						pack_id: selected_parent_pack.value,
					},
				}),
				thing_id: undefined,
			});

			alert("all done!");
			if (!create_more) {
				nav(`/dashboard/${new_note_id}`);
			}
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	return (
		<div className="p-2">
			<h1>NewNote</h1>

			<h1 className="mt-2">enter a title : </h1>
			<input id="title" className="border border-blue-400 px-1 rounded" />
			<PrivilegesEditor onChange={set_privileges} />
			<h1 className="mt-2">select a parent pack for this note if you want :</h1>
			<Select
				onChange={select_parent_pack}
				value={selected_parent_pack}
				options={[
					{ value: null, label: "without a parent pack " },
					...cache
						.filter((i) => i.thing.type === "unit/pack")
						.map((i) => {
							return {
								value: i.thing_id,
								label: i.thing.value.title,
							};
						}),
				]}
				isSearchable
			/>
			<StyledDiv onClick={submit_new_note} className="w-fit mt-2">
				submit this note
			</StyledDiv>
			<CreateMore
				onchange={(new_state) => {
					set_create_more(new_state);
				}}
			/>
		</div>
	);
};
