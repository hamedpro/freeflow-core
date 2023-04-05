import React, { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { update_document } from "../api/client";
import { PackViewModificationStage } from "./components/PackViewModificationStage";
import { GlobalDataContext } from "./GlobalDataContext";

export const EditPackView = () => {
	var [search_params, set_search_params] = useSearchParams();
	var pack_view_id = search_params.get("pack_view_id");
	var pack_id = search_params.get("pack_id");
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var current_pack_view = global_data.all.pack_views.find((i) => i._id === pack_view_id);
	var related_pack = global_data.all.packs.find((i) => i._id === pack_id);
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
	async function remove_pack_view_default() {
		await update_document({
			collection: "packs",
			update_filter: {
				_id: pack_id,
			},
			update_set: {
				default_pack_view_id: null,
			},
		});
		await get_global_data();
	}
	async function set_pack_view_default() {
		await update_document({
			collection: "packs",
			update_filter: {
				_id: pack_id,
			},
			update_set: {
				default_pack_view_id: pack_view_id,
			},
		});
		await get_global_data();
	}
	return (
		<>
			{related_pack.default_pack_view_id === pack_view_id ? (
				<>
					<p>
						default pack view status : this pack view is the default pack view of this
						pack{" "}
					</p>
					<button onClick={remove_pack_view_default}>remove default </button>
				</>
			) : (
				<>
					<p>
						default pack view status : this pack view is not the default pack view of
						this pack{" "}
					</p>
					<button onClick={set_pack_view_default}>set this the default one </button>
				</>
			)}
			<PackViewModificationStage
				initial_order={current_pack_view.order}
				onSubmit={update_order}
				pack_id={pack_id}
			/>
		</>
	);
};
