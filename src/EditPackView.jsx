import React, { useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { update_document } from "../api/client";
import { PackViewModificationStage } from "./components/PackViewModificationStage";
import { GlobalDataContext } from "./GlobalDataContext";

export const EditPackView = () => {
	var [search_params, set_search_params] = useSearchParams();
	var pack_view_id = search_params.get("pack_view_id");
	var pack_id = search_params.get("pack_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var current_pack_view = global_data.all.pack_views.find((i) => i._id === pack_view_id);
	async function update_order(order, name) {
		var update_filter = {
			_id: current_pack_view._id,
		};
		var update_set = {
			order,
			name,
		};
		await update_document({
			collection: "pack_views",
			update_filter,
			update_set,
		});
		await get_global_data();
		alert("all done successfuly!");
	}
	return (
		<PackViewModificationStage
			initial_order={current_pack_view.order}
			onSubmit={update_order}
			pack_id={pack_id}
		/>
	);
};
