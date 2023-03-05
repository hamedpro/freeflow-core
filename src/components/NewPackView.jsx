import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { new_document } from "../../api/client";
import { GlobalDataContext } from "../GlobalDataContext";
import { PackViewItem } from "./PackView";
import { StyledDiv, StyledInput } from "./styled_elements";

export const NewPackView = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var { pack_id } = useParams();
	//items of new_order : {id : string  , unit_context : string }
	var [new_order, set_new_order] = useState([]);

	var pack_children = [];
	["packs", "resources", "notes", "tasks"].forEach((key) => {
		pack_children = pack_children.concat(
			global_data.all[key]
				.filter((i) => i.pack_id === pack_id)
				.map((i) => ({ context: key, child: i }))
		);
	});
	async function submit_this_view() {
		var tmp = {
			order: new_order,
			name: document.getElementById("pack_view_name_input").value,
			pack_id: pack_id,
		};
		await new_document({
			collection_name: "pack_views",
			document: tmp,
		});
		alert("done successfuly!");
		get_global_data();
	}
	return (
		<div className="p-2">
			<h1>NewPackView</h1>
			<h1>enter a name for this new pack view : </h1>
			<StyledInput id="pack_view_name_input" />
			<StyledDiv className="w-fit mt-2" onClick={() => set_new_order([])}>
				reset selection
			</StyledDiv>
			{pack_children.map((i) => {
				return (
					<div
						className="border border-blue-400 w-full flex"
						key={i.context + i.child._id}
					>
						<div className="w-1/5 h-full flex items-center justify-center">
							{new_order.findIndex(
								(j) => j.id === i.child._id && j.unit_context === i.context
							) !== -1 ? (
								`selected  number ${
									new_order.findIndex(
										(j) => j.id === i.child._id && j.unit_context === i.context
									) + 1
								}`
							) : (
								<button
									onClick={() => {
										set_new_order((prev) => [
											...prev,
											{ id: i.child._id, unit_context: i.context },
										]);
									}}
								>
									select
								</button>
							)}
						</div>
						<div className="w-4/5 h-full">
							<PackViewItem thing={i.child} context={i.context} />
						</div>
					</div>
				);
			})}
			<StyledDiv className="w-fit mt-2" onClick={submit_this_view}>
				submit this view
			</StyledDiv>
		</div>
	);
};
