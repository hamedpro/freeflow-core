import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";

import { StyledDiv } from "./styled_elements";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { PrivilegesEditor } from "./PrivilegesEditor";
export const NewResource = () => {
	var nav = useNavigate();
	var { cache } = useContext(UnifiedHandlerClientContext);
	var [privileges, set_privileges] = useState();
	var [search_params] = useSearchParams();
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

	async function upload_files_handler() {
		var [file] = document.getElementById("file_input").files;
		if (!file) {
			alert("you have not selected any file to upload.");
			return;
		}
		var description = document.getElementById("description_input").value;
		var title = document.getElementById("title_input").value;
		try {
			var f = new FormData();
			f.append("file", file);
			var file_id = (
				await uhc.configured_axios({
					data: f,
					url: "/files",
					method: "post",
				})
			).data;

			var new_resource_id = await uhc.request_new_transaction({
				new_thing_creator: () => ({
					type: "unit/resource",
					value: {
						description,
						title,
						file_id,
					},
				}),
				thing_id: undefined,
			});
			alert(`all done! navigating to this new uploaded resource ...`);
			nav(`/dashboard/${new_resource_id}`);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}

	return (
		<div className="p-2">
			<div>NewResource</div>

			<p>select the file you want to upload : </p>
			<input className="px-1" type="file" id="file_input" />
			<h1>enter a title:</h1>
			<input className="px-1 rounded" id="title_input" />
			<h1>enter a description:</h1>
			<textarea className="px-1 rounded" id="description_input" rows={5}></textarea>
			<PrivilegesEditor onChange={set_privileges} />
			<h1>select a parent pack if you want : </h1>
			<Select
				onChange={set_selected_parent_pack}
				value={selected_parent_pack}
				options={[
					{ value: null, label: "without a parent " },
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
			<StyledDiv onClick={upload_files_handler} className="w-fit mt-2">
				upload this resource
			</StyledDiv>
		</div>
	);
};
