import React, { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

export const CheckDefaultParentPack = ({ children }) => {
	var { cache, strings } = useContext(UnifiedHandlerClientContext)
	var [search_params, set_search_params] = useSearchParams();
	var pack_id = Number(search_params.get("pack_id"));

	if (
		pack_id &&
		cache.find((i) => i.thing.type === "unit/pack" && i.thing_id === pack_id) === undefined
	) {
		return strings[191]
	}

	return children;
};
