import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { PackViewModificationStage } from "./components/PackViewModificationStage";
import { new_document } from "../api/client";
import { GlobalDataContext } from "./GlobalDataContext";
export const NewPackViewPage = () => {
	var { pack_id } = useParams();
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	async function submit_this_view(order, name) {
		var tmp = {
			order,
			name,
			pack_id,
		};
		await new_document({
			collection_name: "pack_views",
			document: tmp,
		});
		alert("done successfuly!");
		get_global_data();
	}
	return <PackViewModificationStage pack_id={pack_id} onSubmit={submit_this_view} />;
};
