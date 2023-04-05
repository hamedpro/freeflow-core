import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GlobalDataContext } from "../GlobalDataContext";
import { PackViewItem } from "./PackView";
import { StyledDiv, StyledInput } from "./styled_elements";
export const PackViewModificationStage = ({ initial_order, onSubmit = () => {}, pack_id }) => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	//items of new_order : {id : string  , unit_context : string }
	var [new_order, set_new_order] = useState(initial_order || []);
	var pack_children = [];
	["packs", "resources", "notes", "tasks"].forEach((key) => {
		pack_children = pack_children.concat(
			global_data.all[key]
				.filter((i) => i.pack_id === pack_id)
				.map((i) => ({ context: key, child: i }))
		);
	});

	return (
		<div className="p-2">
			<h1>NewPackView</h1>
			<StyledDiv className="w-fit mt-2" onClick={() => set_new_order([])}>
				reset selection
			</StyledDiv>
			<h1>
				select items in any order you want (its not necessary to select all items ). then
				type a name for this pack view and hit submit{" "}
			</h1>
			<div className="p-2 border border-white mx-auto mt-2">
				{pack_children.map((i) => {
					return (
						<div
							className="border border-blue-400 w-full flex px-2"
							key={i.context + i.child._id}
						>
							<div className="w-1/5 h-full flex items-center justify-center">
								{new_order.findIndex(
									(j) => j.id === i.child._id && j.unit_context === i.context
								) !== -1 ? (
									<>
										<i className="bi-toggle-on"></i>{" "}
										{new_order.findIndex(
											(j) =>
												j.id === i.child._id && j.unit_context === i.context
										) + 1}
									</>
								) : (
									<button
										onClick={() => {
											set_new_order((prev) => [
												...prev,
												{ id: i.child._id, unit_context: i.context },
											]);
										}}
									>
										<i className="bi-toggle-off"></i>
									</button>
								)}
							</div>
							<div className="w-4/5 h-full">
								<PackViewItem thing={i} context={i.context} />
							</div>
						</div>
					);
				})}
			</div>
			<h1>enter a name for this new pack view : </h1>
			<StyledInput id="pack_view_name_input" />
			<StyledDiv
				className="w-fit mt-2"
				onClick={() =>
					onSubmit(new_order, document.getElementById("pack_view_name_input").value)
				}
			>
				submit this view
			</StyledDiv>
		</div>
	);
};
