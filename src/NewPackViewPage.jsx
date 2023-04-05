import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { PackViewModificationStage } from "./components/PackViewModificationStage";
import { new_document, update_document } from "../api/client";
import { GlobalDataContext } from "./GlobalDataContext";
export const NewPackViewPage = () => {
	var { pack_id } = useParams();
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var [this_is_default_view, set_this_is_default_view] = useState(false);

	async function submit_this_view(order, name) {
		var tmp = {
			order,
			name,
			pack_id,
		};
		var inserted_row = await new_document({
			collection_name: "pack_views",
			document: tmp,
		});
		if (this_is_default_view) {
			await update_document({
				collection: "packs",
				update_filter: {
					_id: pack_id,
				},
				update_set: {
					default_pack_view_id: inserted_row,
				},
			});
		}

		alert("done successfuly!");
		get_global_data();
	}
	return (
		<div className="p-2">
			<p
				onClick={() => set_this_is_default_view((prev) => !prev)}
				className="flex items-center space-x-2"
			>
				{this_is_default_view ? (
					<button className="bi-toggle-on text-xl" />
				) : (
					<button className="bi-toggle-off text-xl" />
				)}
				<span>also set it as default pack view</span>
			</p>
			<PackViewModificationStage pack_id={pack_id} onSubmit={submit_this_view} />
		</div>
	);
};
